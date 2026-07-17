import { Category, Farmer, Product, Subcategory, User, DropPoint, FarmerSpecialty } from "@/generated/prisma/client";

export type FarmerWithRelations = Farmer & {
  user: User & {
    products: (Product & {
      category: Category | null;
      subcategory: Subcategory | null;
    })[];
  };
  specialties?: FarmerSpecialty[];
  dropPoints?: DropPoint[];
  distance?: number;
  isOpen?: boolean;
};

export interface IFarmerRepository {
  getNearbyFarmers(params: {
    lat?: number;
    lng?: number;
    radius?: number | string;
    search?: string;
    category?: string;
    isOrganic?: boolean;
    isOpenNow?: boolean;
    allRadius?: boolean;
  }): Promise<FarmerWithRelations[]>;
}

