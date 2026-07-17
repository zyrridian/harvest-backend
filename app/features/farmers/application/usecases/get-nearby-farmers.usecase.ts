import { IFarmerRepository } from "../../domain/repositories/farmer.repository";
import { GetNearbyFarmersQuery, NearbyFarmerData } from "../dtos/farmer.dto";

export class GetNearbyFarmersUseCase {
  constructor(private farmerRepository: IFarmerRepository) { }

  async execute(query: GetNearbyFarmersQuery): Promise<NearbyFarmerData[]> {
    const { lat, lng, radius, all_radius, search, category, is_organic, is_open_now } = query;

    const farmers = await this.farmerRepository.getNearbyFarmers({
      lat,
      lng,
      radius: radius !== undefined ? radius : 3,
      allRadius: all_radius,
      search,
      category,
      isOrganic: is_organic,
      isOpenNow: is_open_now,
    });

    return farmers.map((farmer) => {
      const tags: string[] = [];

      const hasOrganicProduct = farmer.user?.products?.some((p) => p.isOrganic) || false;
      if (hasOrganicProduct) tags.push("Organic");

      if (farmer.specialties && farmer.specialties.length > 0) {
        farmer.specialties.forEach((s) => {
          if (!tags.includes(s.specialty)) tags.push(s.specialty);
        });
      }

      if (farmer.dropPoints && farmer.dropPoints.length > 0) {
        farmer.dropPoints.forEach((dp: any) => {
          if (dp.isActive && dp.tags && Array.isArray(dp.tags)) {
            dp.tags.forEach((t: string) => {
              if (!tags.includes(t)) tags.push(t);
            });
          }
        });
      }

      let primaryCategory = "General";
      let primarySubcategory = "Various";
      if (farmer.user?.products && farmer.user.products.length > 0) {
        const firstProduct = farmer.user.products[0];
        if (firstProduct.category) primaryCategory = firstProduct.category.name;
        if (firstProduct.subcategory) primarySubcategory = firstProduct.subcategory.name;
      } else if (farmer.specialties && farmer.specialties.length > 0) {
        primaryCategory = farmer.specialties[0].specialty;
      }

      const isOpen = (farmer as any).isOpen !== undefined ? (farmer as any).isOpen : true;
      const statusText = isOpen ? "Open now" : "Closed";
      const statusSubText = isOpen ? "closes today" : "opens tomorrow";

      const products = farmer.user?.products?.map((p) => ({ name: p.name })) || [];

      const totalProductsCount = farmer.totalProducts || farmer.user?.products?.length || 0;
      const extraProductsCount = totalProductsCount > products.length ? totalProductsCount - products.length : 0;

      const cabang = (farmer.dropPoints || [])
        .filter((dp: any) => dp.isActive)
        .map((dp: any) => ({
          id: dp.id,
          name: dp.name,
          description: dp.description || null,
          whatWeSell: dp.whatWeSell || null,
          latitude: dp.latitude,
          longitude: dp.longitude,
          address: dp.address || null,
          imageUrl: dp.imageUrl || null,
          operatingHours: dp.operatingHours || null,
          isActive: dp.isActive,
          tags: dp.tags || [],
          distance: dp.distance !== undefined && dp.distance !== null ? parseFloat(Number(dp.distance).toFixed(1)) : 0.0,
        }));

      return {
        id: farmer.id,
        name: farmer.name,
        distance: farmer.distance !== undefined && farmer.distance !== null ? parseFloat(Number(farmer.distance).toFixed(1)) : 0.0,
        category: primaryCategory,
        subCategory: primarySubcategory,
        rating: farmer.rating || 0.0,
        reviewCount: farmer.totalReviews || 0,
        tags,
        products,
        extraProductsCount,
        statusText,
        statusSubText,
        isOpen,
        latitude: farmer.latitude || 0.0,
        longitude: farmer.longitude || 0.0,
        iconPath: farmer.profileImage || "🧑‍🌾",
        mainLocation: {
          latitude: farmer.latitude || 0.0,
          longitude: farmer.longitude || 0.0,
          address: farmer.address || null,
          city: farmer.city || null,
          state: farmer.state || null,
        },
        cabang,
      };
    });
  }
}

