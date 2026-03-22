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

  const provinces = await getProvinces();
  console.log(`🌍 Seeding ${provinces.length} Provinces...`);
  
  // Batch insert/upsert for better performance
  const provincePromises = provinces.map((p) => {
    return prisma.province.upsert({
      where: { id: parseInt(p.code, 10) },
      update: { name: p.name },
      create: { id: parseInt(p.code, 10), name: p.name },
    });
  });
  await Promise.all(provincePromises);

  const regencies = await getRegencies();
  console.log(`🏙️  Seeding ${regencies.length} Cities/Regencies...`);
  
  const cityPromises = regencies.map((c) => {
    return prisma.city.upsert({
      where: { id: parseInt(c.code, 10) },
      update: { 
        name: c.name, 
        provinceId: parseInt(c.province_code, 10) 
      },
      create: { 
        id: parseInt(c.code, 10), 
        name: c.name, 
        provinceId: parseInt(c.province_code, 10) 
      },
    });
  });
  // Batch in chunks if too large, but 500 cities should be fine for Promise.all
  await Promise.all(cityPromises);

  const districts = await getDistricts();
  console.log(`🏘️  Seeding ${districts.length} Districts...`);
  
  // 7000+ districts might overwhelm the connection pool if done all at once.
  // We'll insert them in chunks.
  const chunkSize = 500;
  for (let i = 0; i < districts.length; i += chunkSize) {
    const chunk = districts.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((d) => {
      // idn-area-data exports `regency_code` for districts by default based on its types and csv mapping
      const regencyCode = (d as any).regency_code || (d as any).regencyCode;
      return prisma.district.upsert({
        where: { id: parseInt(d.code, 10) },
        update: { 
          name: d.name, 
          cityId: parseInt(regencyCode, 10) 
        },
        create: { 
          id: parseInt(d.code, 10), 
          name: d.name, 
          cityId: parseInt(regencyCode, 10) 
        },
      });
    });
    await Promise.all(chunkPromises);
    console.log(`   - Seeded ${Math.min(i + chunkSize, districts.length)} / ${districts.length} districts`);
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
