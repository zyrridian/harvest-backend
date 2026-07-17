import { z } from "zod";

export const GetNearbyFarmersQuerySchema = z.object({
  lat: z.coerce.number().optional().default(-6.2),
  lng: z.coerce.number().optional().default(106.8),
  radius: z
    .union([z.coerce.number(), z.string()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === "") return 3;
      if (val === "all" || val === "All" || val === "ALL") return "all";
      const num = Number(val);
      return isNaN(num) || num <= 0 ? "all" : num;
    }),
  all_radius: z.coerce.boolean().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  is_organic: z.coerce.boolean().optional(),
  is_open_now: z.coerce.boolean().optional(),
});

export type GetNearbyFarmersQuery = z.infer<typeof GetNearbyFarmersQuerySchema>;

export interface NearbyFarmerProduct {
  name: string;
}

export interface NearbyCabangData {
  id: string;
  name: string;
  description: string | null;
  whatWeSell: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  imageUrl: string | null;
  operatingHours: any;
  isActive: boolean;
  tags: string[];
  distance: number;
}

export interface NearbyFarmerData {
  id: string;
  name: string;
  distance: number;
  category: string;
  subCategory: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  products: NearbyFarmerProduct[];
  extraProductsCount: number;
  statusText: string;
  statusSubText: string;
  isOpen: boolean;
  latitude: number;
  longitude: number;
  iconPath: string;
  mainLocation: {
    latitude: number;
    longitude: number;
    address: string | null;
    city: string | null;
    state: string | null;
  };
  cabang: NearbyCabangData[];
}

