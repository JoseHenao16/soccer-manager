import { z } from "zod";

export const changeRoleSchema = z.object({
  role: z.enum(["ADMIN", "USER"], { error: "Rol inválido" }),
});

/**
 * Modelos de Groq permitidos (plan gratuito). gpt-oss-20b se excluyó: en las pruebas
 * respondió fuera del dominio e inventó datos (docs/PRUEBAS-IA.md).
 */
export const ALLOWED_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b"] as const;

/** Límite del System Prompt (~3.000 tokens: deja margen en el cupo de 8.000 tokens/min de Groq). */
export const PROMPT_MAX = 12000;

export const assistantConfigSchema = z.object({
  systemPrompt: z
    .string()
    .trim()
    .min(50, "El System Prompt debe tener al menos 50 caracteres")
    .max(PROMPT_MAX, `El System Prompt no puede superar ${PROMPT_MAX} caracteres`),
  model: z.enum(ALLOWED_MODELS, { error: "Modelo no permitido" }),
  temperature: z.number().min(0, "Mínimo 0").max(1.5, "Máximo 1.5"),
  maxTokens: z.number().int().min(128, "Mínimo 128").max(4096, "Máximo 4096"),
  historyLimit: z.number().int().min(1, "Mínimo 1").max(40, "Máximo 40"),
});
