import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { getProvinces, getRegencies, getDistricts } from "idn-area-data";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting locations seed from idn-area-data...");

  // ======================
  // PROVINCES
  // ======================
  const provinces = await getProvinces();
  console.log(`🌍 Seeding ${provinces.length} Provinces...`);

  await prisma.province.createMany({
    data: provinces.map((p) => ({
      id: parseInt(p.code, 10),
      name: p.name,
    })),
    skipDuplicates: true,
  });

  // ======================
  // CITIES / REGENCIES
  // ======================
  const regencies = await getRegencies();
  console.log(`🏙️ Seeding ${regencies.length} Cities/Regencies...`);

  await prisma.city.createMany({
    data: regencies.map((c) => {
      const provinceCode =
        (c as any).province_code || (c as any).provinceCode;

      return {
        id: parseInt(c.code, 10),
        name: c.name,
        provinceId: parseInt(provinceCode, 10),
      };
    }),
    skipDuplicates: true,
  });

  // ======================
  // DISTRICTS (CHUNKED)
  // ======================
  const districts = await getDistricts();
  console.log(`🏘️ Seeding ${districts.length} Districts...`);

  const chunkSize = 1000;

  for (let i = 0; i < districts.length; i += chunkSize) {
    const chunk = districts.slice(i, i + chunkSize);

    await prisma.district.createMany({
      data: chunk.map((d) => {
        const regencyCode =
          (d as any).regency_code || (d as any).regencyCode;

        return {
          id: parseInt(d.code, 10),
          name: d.name,
          cityId: parseInt(regencyCode, 10),
        };
      }),
      skipDuplicates: true,
    });

    console.log(
      `   - Seeded ${Math.min(i + chunkSize, districts.length)} / ${districts.length} districts`
    );
  }

  console.log("✅ All master geographical locations seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding locations:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });