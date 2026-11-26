import "server-only";
import type { AIProvider } from "@/core/domain/ports/ai-provider";
import { GroqProvider } from "./groq-provider";
import { MockAIProvider } from "./mock-provider";

/** Factory: elige el proveedor según AI_PROVIDER (mock | groq). */
export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? "mock";
  switch (provider) {
    case "mock":
      return new MockAIProvider();
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("AI_PROVIDER=groq requiere GROQ_API_KEY");
      return new GroqProvider(apiKey);
    }
    default:
      throw new Error(`AI_PROVIDER desconocido: ${provider}`);
  }
}
