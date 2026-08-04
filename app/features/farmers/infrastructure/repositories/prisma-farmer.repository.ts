import { IFarmerRepository, FarmerWithRelations } from "../../domain/repositories/farmer.repository";
import prisma from "@/core/database/prisma";

export class PrismaFarmerRepository implements IFarmerRepository {
  async getNearbyFarmers(params: {
    lat?: number;
    lng?: number;
    radius?: number | string;
    search?: string;
    category?: string;
    isOrganic?: boolean;
    isOpenNow?: boolean;
    allRadius?: boolean;
  }): Promise<FarmerWithRelations[]> {
    const { lat, lng, radius = 3, search, category, isOrganic, isOpenNow, allRadius } = params;

    // Build the query
    let whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          user: {
            products: {
              some: {
                name: { contains: search, mode: "insensitive" },
              },
            },
          },
        },
        {
          dropPoints: {
            some: {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { whatWeSell: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
      ];
    }

    if (isOrganic) {
      const organicFilter = {
        user: {
          products: {
            some: {
              isOrganic: true,
            },
          },
        },
      };
      if (whereClause.AND) {
        if (Array.isArray(whereClause.AND)) whereClause.AND.push(organicFilter);
        else whereClause.AND = [whereClause.AND, organicFilter];
      } else {
        whereClause.AND = [organicFilter];
      }
    }

    if (category && category.trim() !== "" && category.toLowerCase() !== "all") {
      const catFilters = [
        {
          user: {
            products: {
              some: {
                OR: [
                  { category: { name: { equals: category, mode: "insensitive" } } },
                  { category: { slug: { equals: category, mode: "insensitive" } } },
                  { subcategory: { name: { equals: category, mode: "insensitive" } } },
                  { subcategory: { slug: { equals: category, mode: "insensitive" } } },
                ],
              },
            },
          },
        },
        {
          specialties: {
            some: {
              specialty: { equals: category, mode: "insensitive" },
            },
          },
        },
        {
          dropPoints: {
            some: {
              OR: [
                { whatWeSell: { contains: category, mode: "insensitive" } },
                { tags: { has: category } },
              ],
            },
          },
        },
      ];

      if (whereClause.AND) {
        if (Array.isArray(whereClause.AND)) whereClause.AND.push({ OR: catFilters });
        else whereClause.AND = [whereClause.AND, { OR: catFilters }];
      } else if (whereClause.OR) {
        whereClause = {
          AND: [{ OR: whereClause.OR }, { OR: catFilters }],
        };
      } else {
        whereClause.OR = catFilters;
      }
    }

    const farmers = await prisma.farmer.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            products: {
              where: {
                isAvailable: true,
              },
              include: {
                category: true,
                subcategory: true,
              },
              take: 5,
            },
          },
        },
        specialties: true,
        dropPoints: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    let nearbyFarmers: FarmerWithRelations[] = [];

    const isAllRadius =
      allRadius ||
      radius === "all" ||
      radius === "All" ||
      radius === "ALL" ||
      radius === Infinity ||
      (typeof radius === "number" && radius >= 99999);

    const numRadius = typeof radius === "number" ? radius : (radius === "all" || isAllRadius ? Infinity : parseFloat(String(radius)) || Infinity);

    for (const farmer of farmers) {
      let mainDistance: number | null = null;
      if (farmer.latitude != null && farmer.longitude != null && lat != null && lng != null) {
        mainDistance = this.calculateDistance(lat, lng, farmer.latitude, farmer.longitude);
      }

      const cabangDistances: number[] = [];
      if (farmer.dropPoints && farmer.dropPoints.length > 0) {
        for (const dp of farmer.dropPoints) {
          if (dp.latitude != null && dp.longitude != null && lat != null && lng != null) {
            const dpDist = this.calculateDistance(lat, lng, dp.latitude, dp.longitude);
            (dp as any).distance = dpDist;
            if (dp.isActive) {
              cabangDistances.push(dpDist);
            }
          } else {
            (dp as any).distance = 0;
          }
        }
      }

      const allValidDistances: number[] = [];
      if (mainDistance != null) allValidDistances.push(mainDistance);
      allValidDistances.push(...cabangDistances);

      const minDistance = allValidDistances.length > 0 ? Math.min(...allValidDistances) : (mainDistance ?? 0);
      (farmer as any).distance = minDistance;

      let isOpen = true;
      if (farmer.dropPoints && farmer.dropPoints.length > 0) {
        const activeDropPoints = farmer.dropPoints.filter((dp) => dp.isActive);
        if (activeDropPoints.length > 0) {
          isOpen = activeDropPoints.some((dp) => this.isDropPointOpen(dp.operatingHours));
        }
      }
      (farmer as any).isOpen = isOpen;

      if (isOpenNow && !isOpen) {
        continue;
      }

      if (!isAllRadius && minDistance > numRadius) {
        continue;
      }

      nearbyFarmers.push(farmer as unknown as FarmerWithRelations);
    }

    nearbyFarmers.sort((a, b) => (a.distance ?? 9999) - (b.distance ?? 9999));

    return nearbyFarmers;
  }

  private isDropPointOpen(operatingHours: any): boolean {
    if (!operatingHours) return true;
    try {
      let schedule = operatingHours;
      if (typeof schedule === "string") {
        schedule = JSON.parse(schedule);
      }
      if (typeof schedule !== "object" || schedule === null) return true;

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const now = new Date();
      const currentDay = days[now.getDay()];
      
      const daySchedule = schedule[currentDay] || schedule[currentDay.substring(0, 3)] || schedule[String(now.getDay())];
      if (!daySchedule) return true;

      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      if (daySchedule.open && daySchedule.close) {
        return currentTime >= daySchedule.open && currentTime <= daySchedule.close;
      }
      return true;
    } catch {
      return true;
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const lat1Rad = this.toRad(lat1);
    const lat2Rad = this.toRad(lat2);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  private toRad(value: number): number {
    return (value * Math.PI) / 180;
  }
}

export const farmerRepository = new PrismaFarmerRepository();

