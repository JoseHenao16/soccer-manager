import "server-only";
import type { AIProvider } from "@/core/domain/ports/ai-provider";
import { MockAIProvider } from "./mock-provider";

/** Factory: elige el proveedor según AI_PROVIDER (mock | groq). */
export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "mock";
  switch (provider) {
    case "mock":
      return new MockAIProvider();
    // case "groq": → GroqProvider (Fase 5)
    default:
      throw new Error(`AI_PROVIDER desconocido: ${provider}`);
  }
}
