import { registerUser } from "@/core/application/use-cases/auth";
import { makeAuthGateway, repositories } from "@/lib/container";
import { handleApiError, json, parseBody } from "@/lib/http";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const input = await parseBody(request, registerSchema);
    const user = await registerUser({ auth: await makeAuthGateway(), users: repositories.users }, input);
    return json({ user }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
