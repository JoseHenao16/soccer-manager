import type { AssistantMode, MessageRole } from "@/core/domain/entities";

// DTOs tal como llegan por JSON (fechas como string).
export interface ConversationDTO {
  id: string;
  title: string;
  mode: AssistantMode;
  createdAt: string;
  updatedAt: string;
}

export interface MessageDTO {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  latencyMs?: number | null;
  /** Solo en cliente: mensaje optimista que falló al enviarse. */
  failed?: boolean;
}

/** Eventos NDJSON de POST /api/conversations/[id]/messages con stream: true. */
export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; conversation: ConversationDTO; userMessage: MessageDTO; assistantMessage: MessageDTO }
  | { type: "error"; code: string; message: string; retryable: boolean };

export const MODES: { value: AssistantMode; label: string; description: string; icon: string }[] = [
  { value: "GENERAL", label: "General", description: "Todo sobre fútbol", icon: "⚽" },
  { value: "ENTRENADOR", label: "Entrenador", description: "Sesiones y ejercicios", icon: "📋" },
  { value: "ARBITRO", label: "Árbitro", description: "Reglas IFAB y VAR", icon: "🟨" },
  { value: "ANALISTA", label: "Analista", description: "Táctica y sistemas", icon: "📊" },
];

export const SUGGESTIONS: Record<AssistantMode, string[]> = {
  GENERAL: [
    "¿Qué diferencia hay entre un 4-3-3 y un 4-2-3-1?",
    "¿Cómo debe calentar un equipo amateur antes de un partido?",
    "Explícame qué es el juego de posición",
  ],
  ENTRENADOR: [
    "Diseña una sesión de 75 minutos para sub-15 enfocada en transiciones",
    "Dame 3 rondos para mejorar la circulación de balón",
    "¿Cómo planifico una pretemporada de 4 semanas?",
  ],
  ARBITRO: [
    "¿Es fuera de juego si recibo directamente de un saque de banda?",
    "¿Cuándo una mano dentro del área es penal?",
    "¿En qué situaciones puede intervenir el VAR?",
  ],
  ANALISTA: [
    "¿Cómo presionar alto a un equipo que sale con tres centrales?",
    "Ventajas y debilidades de defender en bloque bajo",
    "¿Cómo atacar a un rival que juega 5-3-2?",
  ],
};

export const modeInfo = (mode: AssistantMode) => MODES.find((m) => m.value === mode) ?? MODES[0];
