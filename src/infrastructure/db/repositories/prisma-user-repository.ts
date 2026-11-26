import "server-only";
import type { Role, User } from "@/core/domain/entities";
import type { UserRepository } from "@/core/domain/ports/repositories";
import { prisma } from "../prisma";

const select = { id: true, email: true, name: true, role: true, createdAt: true } as const;

export class PrismaUserRepository implements UserRepository {
  findById(id: string): Promise<User | null> {
    return prisma.profile.findUnique({ where: { id }, select });
  }

  create(data: { id: string; email: string; name?: string | null; role?: Role }): Promise<User> {
    // upsert evita condiciones de carrera si dos requests crean el perfil a la vez.
    return prisma.profile.upsert({
      where: { id: data.id },
      update: {},
      create: { id: data.id, email: data.email, name: data.name ?? null, role: data.role ?? "USER" },
      select,
    });
  }

  list(): Promise<User[]> {
    return prisma.profile.findMany({ orderBy: { createdAt: "desc" }, select });
  }

  updateRole(id: string, role: Role): Promise<User> {
    return prisma.profile.update({ where: { id }, data: { role }, select });
  }

  countByRole(role: Role): Promise<number> {
    return prisma.profile.count({ where: { role } });
  }
}
