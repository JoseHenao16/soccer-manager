/**
 * Seed: crea (o promueve) el usuario ADMIN y la configuración inicial del asistente.
 * Uso: npm run db:seed   (requiere SUPABASE_SECRET_KEY, ADMIN_EMAIL, ADMIN_PASSWORD en .env)
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_SYSTEM_PROMPT } from "../src/core/domain/assistant";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }),
});

async function findAuthUserByEmail(
  supabase: SupabaseClient,
  email: string,
) {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found || data.users.length < 200) return found ?? null;
  }
  return null;
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Faltan ADMIN_EMAIL / ADMIN_PASSWORD en .env");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  // 1. Usuario en Supabase Auth (idempotente)
  let authUser = await findAuthUserByEmail(supabase, email);
  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Administrador" },
    });
    if (error) throw error;
    authUser = data.user;
    console.log(`✔ Usuario ADMIN creado en Supabase Auth: ${email}`);
  } else {
    console.log(`• Usuario ${email} ya existía en Supabase Auth`);
  }

  // 2. Profile con rol ADMIN
  await prisma.profile.upsert({
    where: { id: authUser.id },
    update: { role: "ADMIN" },
    create: { id: authUser.id, email, name: "Administrador", role: "ADMIN" },
  });
  console.log("✔ Profile ADMIN listo");

  // 3. Configuración del asistente (solo si no existe, para no pisar cambios del ADMIN)
  await prisma.assistantConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, systemPrompt: DEFAULT_SYSTEM_PROMPT },
  });
  console.log("✔ Configuración del asistente lista");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
