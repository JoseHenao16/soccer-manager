-- Bloquea el acceso vía la Data API pública de Supabase (anon/authenticated).
-- La app accede solo desde el backend con Prisma (rol postgres, que omite RLS).
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "assistant_config" ENABLE ROW LEVEL SECURITY;
