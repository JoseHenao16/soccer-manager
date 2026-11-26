import { changeUserRole } from "@/core/application/use-cases/admin";
import { NotFoundError } from "@/core/domain/errors";
import { repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { changeRoleSchema } from "@/lib/validation/admin";
import { idSchema } from "@/lib/validation/conversations";

/** Cambiar el rol de un usuario (ADMIN ↔ USER). */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  try {
    const admin = await requireAdmin();
    const { id } = await ctx.params;
    if (!idSchema.safeParse(id).success) throw new NotFoundError("Usuario no encontrado");
    const { role } = await parseBody(request, changeRoleSchema);
    return json({ user: await changeUserRole(repositories, admin, id, role) });
  } catch (error) {
    return handleApiError(error);
  }
}
