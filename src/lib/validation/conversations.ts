import { z } from "zod";

export const modeSchema = z.enum(["GENERAL", "ENTRENADOR", "ARBITRO", "ANALISTA"], {
  error: "Modo inválido",
});

export const idSchema = z.uuid();

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  mode: modeSchema.optional(),
});

export const updateConversationSchema = z
  .object({
    title: z.string().trim().min(1, "El título no puede estar vacío").max(80, "Máximo 80 caracteres").optional(),
    mode: modeSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.mode !== undefined, "Nada que actualizar");

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Escribe una pregunta")
    .max(4000, "La pregunta es demasiado larga (máximo 4000 caracteres)"),
  stream: z.boolean().optional(),
});
