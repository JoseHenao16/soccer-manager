import { loginUser } from "@/core/application/use-cases/auth";
import { makeAuthGateway, repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, loginSchema);
    const user = await loginUser({ auth: await makeAuthGateway(), users: repositories.users }, input);
    return json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
