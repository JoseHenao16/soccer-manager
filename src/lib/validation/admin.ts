import { z } from "zod";

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"], { error: "Rol inválido" }),
});

/** Modelos de Groq permitidos (plan gratuito). */
export const ALLOWED_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"] as const;

export const assistantConfigSchema = z.object({
  systemPrompt: z
    .string()
    .trim()
    .min(50, "El System Prompt debe tener al menos 50 caracteres")
    .max(8000, "El System Prompt no puede superar 8000 caracteres"),
  model: z.enum(ALLOWED_MODELS, { error: "Modelo no permitido" }),
  temperature: z.number().min(0, "Mínimo 0").max(1.5, "Máximo 1.5"),
  maxTokens: z.number().int().min(128, "Mínimo 128").max(4096, "Máximo 4096"),
  historyLimit: z.number().int().min(1, "Mínimo 1").max(40, "Máximo 40"),
});
