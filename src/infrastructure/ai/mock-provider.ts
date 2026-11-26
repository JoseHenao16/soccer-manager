import type {
  AIProvider,
  CompletionRequest,
  CompletionResult,
  StreamChunk,
} from "@/core/domain/ports/ai-provider";

// Proveedor simulado (Taller 2 / desarrollo sin API key): plantillas según palabras clave.
const RESPUESTAS: { keywords: string[]; text: string }[] = [
  {
    keywords: ["4-3-3", "433", "formación", "formacion", "sistema", "táctica", "tactica"],
    text: "**(Respuesta simulada)** El 4-3-3 da amplitud con extremos abiertos y un pivote que equilibra. Claves: laterales que suben por turnos, interiores que pisan área y pressing alto coordinado con el 9.",
  },
  {
    keywords: ["fuera de juego", "offside", "regla", "árbitro", "arbitro", "var", "penal"],
    text: "**(Respuesta simulada)** Según la Regla 11 de la IFAB, un jugador está en fuera de juego si, cuando un compañero juega el balón, está más cerca de la línea de meta rival que el balón y que el penúltimo adversario, y participa activamente en la jugada.",
  },
  {
    keywords: ["entrenamiento", "sesión", "sesion", "ejercicio", "rondo", "físico", "pretemporada"],
    text: "**(Respuesta simulada)** Sesión tipo de 90 minutos: 15 min de activación con rondos 4v2, 25 min de juego de posición 6v6+3, 25 min de finalización, 15 min de partido condicionado y 10 min de vuelta a la calma.",
  },
];

const FALLBACK =
  "**(Respuesta simulada)** Soy The Pizarra Futnorte IA. Puedo ayudarte con táctica, entrenamiento y reglamento de fútbol. En la versión final responderé con un modelo de IA real.";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pick(request: CompletionRequest): string {
  const last = [...request.messages].reverse().find((m) => m.role === "user");
  const text = last?.content.toLowerCase() ?? "";
  return RESPUESTAS.find((r) => r.keywords.some((k) => text.includes(k)))?.text ?? FALLBACK;
}

export class MockAIProvider implements AIProvider {
  readonly name = "mock";

  async complete(request: CompletionRequest): Promise<CompletionResult> {
    await sleep(700 + Math.random() * 600);
    return { content: pick(request), model: "mock", tokens: null, finishReason: "stop" };
  }

  async *stream(request: CompletionRequest): AsyncIterable<StreamChunk> {
    await sleep(500);
    for (const word of pick(request).split(/(?<= )/)) {
      yield { type: "delta", text: word };
      await sleep(25);
    }
    yield { type: "end", model: "mock", tokens: null, finishReason: "stop" };
  }
}
