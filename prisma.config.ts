import "dotenv/config";
import { defineConfig } from "prisma/config";

// La CLI (migraciones) usa la conexión directa/session pooler de Supabase (puerto 5432).
// En runtime la app usa DATABASE_URL (transaction pooler, puerto 6543) vía @prisma/adapter-pg.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
