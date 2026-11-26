"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api-client";

interface Config {
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  historyLimit: number;
  updatedAt: Date | string;
}

export function AssistantForm({
  config,
  models,
  defaultPrompt,
  provider,
}: {
  config: Config;
  models: readonly string[];
  defaultPrompt: string;
  provider: string;
}) {
  const [baseline, setBaseline] = useState(config);
  // Si el modelo guardado ya no está permitido, se propone el primero de la lista.
  const [form, setForm] = useState(() => (models.includes(config.model) ? config : { ...config, model: models[0] }));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const set = <K extends keyof Config>(key: K, value: Config[K]) => setForm((f) => ({ ...f, [key]: value }));
  const dirty =
    form.systemPrompt !== baseline.systemPrompt ||
    form.model !== baseline.model ||
    form.temperature !== baseline.temperature ||
    form.maxTokens !== baseline.maxTokens ||
    form.historyLimit !== baseline.historyLimit;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const { config: saved } = await api.put<{ config: Config }>("/api/admin/assistant", {
        systemPrompt: form.systemPrompt,
        model: form.model,
        temperature: form.temperature,
        maxTokens: form.maxTokens,
        historyLimit: form.historyLimit,
      });
      setForm(saved);
      setBaseline(saved); // nueva base para detectar cambios
      setFeedback({ type: "ok", text: "Configuración guardada. Se aplica desde el próximo mensaje." });
    } catch (err) {
      setFeedback({ type: "error", text: err instanceof ApiError ? err.message : "No se pudo guardar" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="systemPrompt" className="font-semibold">
            System Prompt
          </label>
          <button
            type="button"
            onClick={() => set("systemPrompt", defaultPrompt)}
            className="text-xs text-chalk-muted hover:text-accent"
          >
            Restaurar el prompt por defecto
          </button>
        </div>
        <textarea
          id="systemPrompt"
          value={form.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value)}
          rows={24}
          className="w-full rounded-xl border border-chalk/15 bg-pitch-950/60 p-4 font-mono text-xs leading-relaxed outline-none focus:border-accent"
        />
        <p className="text-right text-xs text-chalk-muted">{form.systemPrompt.length} / 8000 caracteres</p>
      </div>

      <aside className="space-y-5 rounded-xl border border-chalk/10 bg-pitch-800 p-5 lg:self-start">
        <div className="rounded-lg bg-pitch-950/60 px-3 py-2 text-xs text-chalk-muted">
          Proveedor activo: <span className="font-semibold text-chalk">{provider}</span>
          {provider === "mock" && <p className="mt-1">Respuestas simuladas: el modelo y los parámetros se usarán con Groq.</p>}
        </div>

        <Field label="Modelo">
          <select
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            className="w-full rounded-lg border border-chalk/15 bg-pitch-950/60 px-3 py-2 text-sm outline-none focus:border-accent"
          >
            {models.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label={`Temperatura: ${form.temperature.toFixed(1)}`} hint="Más baja = más precisa; más alta = más creativa">
          <input
            type="range"
            min={0}
            max={1.5}
            step={0.1}
            value={form.temperature}
            onChange={(e) => set("temperature", Number(e.target.value))}
            className="w-full accent-[#a3e635]"
          />
        </Field>

        <Field label="Máx. tokens de respuesta">
          <input
            type="number"
            min={128}
            max={4096}
            value={form.maxTokens}
            onChange={(e) => set("maxTokens", Number(e.target.value))}
            className="w-full rounded-lg border border-chalk/15 bg-pitch-950/60 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        <Field label="Mensajes de contexto" hint="Cuántos mensajes previos recuerda el asistente">
          <input
            type="number"
            min={1}
            max={40}
            value={form.historyLimit}
            onChange={(e) => set("historyLimit", Number(e.target.value))}
            className="w-full rounded-lg border border-chalk/15 bg-pitch-950/60 px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </Field>

        {feedback && (
          <p
            role="status"
            className={`rounded-lg border px-3 py-2 text-xs ${
              feedback.type === "ok" ? "border-accent/40 bg-accent/10 text-accent" : "border-danger/40 bg-danger/10 text-danger"
            }`}
          >
            {feedback.text}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !dirty}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-pitch-950 transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Guardando…" : dirty ? "Guardar cambios" : "Sin cambios"}
        </button>
        <p className="text-center text-[11px] text-chalk-muted">
          Última actualización: {new Date(baseline.updatedAt).toLocaleString("es-CO")}
        </p>
      </aside>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-chalk-muted">{hint}</span>}
    </label>
  );
}
