import type { AssistantConfig, Role, User } from "@/core/domain/entities";
import { NotFoundError, ValidationError } from "@/core/domain/errors";
import type {
  AssistantConfigRepository,
  Stats,
  StatsRepository,
  UserRepository,
} from "@/core/domain/ports/repositories";
import { assertAdmin } from "./auth";

// Todos los casos de uso de admin reciben el usuario actual y validan el rol aquí,
// en la capa de aplicación (además del guard de la API / página).

export async function listUsers({ users }: { users: UserRepository }, actor: User | null) {
  assertAdmin(actor);
  return users.list();
}

export async function changeUserRole(
  { users }: { users: UserRepository },
  actor: User | null,
  targetId: string,
  role: Role,
): Promise<User> {
  assertAdmin(actor);
  if (targetId === actor.id) {
    throw new ValidationError("No puedes cambiar tu propio rol (evita quedarte sin acceso)");
  }
  const target = await users.findById(targetId);
  if (!target) throw new NotFoundError("Usuario no encontrado");
  if (target.role === role) return target;
  if (target.role === "ADMIN" && role === "USER" && (await users.countByRole("ADMIN")) <= 1) {
    throw new ValidationError("Debe existir al menos un administrador");
  }
  return users.updateRole(targetId, role);
}

export async function getAssistantConfig(
  { config }: { config: AssistantConfigRepository },
  actor: User | null,
): Promise<AssistantConfig> {
  assertAdmin(actor);
  return config.get();
}

export async function updateAssistantConfig(
  { config }: { config: AssistantConfigRepository },
  actor: User | null,
  data: Partial<Omit<AssistantConfig, "updatedAt">>,
): Promise<AssistantConfig> {
  assertAdmin(actor);
  return config.update(data, actor.id);
}

export async function getStats(
  { stats }: { stats: StatsRepository },
  actor: User | null,
  days = 14,
): Promise<Stats> {
  assertAdmin(actor);
  return stats.overview(days);
}
