import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUILTIN_PROVIDERS, type Protocol } from "@/lib/hydra/providers";
import { targetFor, useProviders } from "@/lib/hydra/provider-store";
import { liveProbe } from "@/lib/hydra/live";

export const Route = createFileRoute("/providers")({ component: ProvidersPage });

function ProvidersPage() {
  const activeId = useProviders((s) => s.activeId);
  const modelByProvider = useProviders((s) => s.modelByProvider);
  const keys = useProviders((s) => s.keys);
  const custom = useProviders((s) => s.custom);
  const setActive = useProviders((s) => s.setActive);
  const setModel = useProviders((s) => s.setModel);
  const setKey = useProviders((s) => s.setKey);
  const addCustom = useProviders((s) => s.addCustom);
  const removeCustom = useProviders((s) => s.removeCustom);
  const compareId = useProviders((s) => s.compareId);
  const lastProbe = useProviders((s) => s.lastProbe);
  const setCompare = useProviders((s) => s.setCompare);
  const setProbe = useProviders((s) => s.setProbe);
  const [probing, setProbing] = useState(false);

  const all = useMemo(() => [...BUILTIN_PROVIDERS, ...custom], [custom]);
  const active = all.find((p) => p.id === activeId) ?? BUILTIN_PROVIDERS[0];

  const [name, setName] = useState("Local llama.cpp");
  const [baseUrl, setBaseUrl] = useState("http://127.0.0.1:8081/v1");
  const [protocol, setProtocol] = useState<Protocol>("openai");
  const [model, setModelDraft] = useState("local-model");
  const [key, setKeyDraft] = useState("");

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Mesh</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">Providers</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Built-in labs plus any OpenAI-compatible, Anthropic, or Google endpoint. Active
            target drives every live hunt.
          </p>
        </div>
        <Badge>{active.name}</Badge>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {all.map((p) => {
          const on = p.id === activeId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(p.id)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                on ? "border-accent bg-elevated" : "border-border bg-surface hover:border-accent/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{p.name}</p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {p.protocol}
                </span>
              </div>
              <p className="mt-2 truncate font-mono text-[11px] text-muted">{p.baseUrl}</p>
              <p className="mt-1 font-mono text-[11px] text-subtle">
                {modelByProvider[p.id] ?? p.models[0]?.id}
              </p>
            </button>
          );
        })}
      </section>

      <section className="grid gap-6 rounded-xl border border-border bg-surface p-5 lg:grid-cols-2">
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Model</p>
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={
              active.models.some((m) => m.id === (modelByProvider[active.id] ?? active.models[0]?.id))
                ? (modelByProvider[active.id] ?? active.models[0]?.id)
                : "__custom__"
            }
            onChange={(e) => {
              if (e.target.value !== "__custom__") setModel(active.id, e.target.value);
            }}
          >
            {active.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
            <option value="__custom__">Custom model id…</option>
          </select>
          <input
            className="w-full rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
            value={modelByProvider[active.id] ?? active.models[0]?.id ?? ""}
            onChange={(e) => setModel(active.id, e.target.value)}
            placeholder="model id"
          />
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">API key</p>
          <input
            type="password"
            autoComplete="off"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            placeholder={active.envKey ? `${active.envKey} or paste here` : "Bearer token"}
            value={keys[active.id] ?? ""}
            onChange={(e) => setKey(active.id, e.target.value)}
          />
          <p className="text-xs text-subtle">
            Browser key is sent only with live cells. Server env {active.envKey || "none"} is the
            fallback.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={probing}
              onClick={async () => {
                setProbing(true);
                const t = targetFor(active.id);
                const res = await liveProbe({
                  data: {
                    protocol: t.protocol,
                    baseUrl: t.baseUrl,
                    model: t.model,
                    apiKey: t.apiKey,
                    envKey: t.envKey,
                  },
                });
                setProbe({
                  at: new Date().toISOString(),
                  ok: res.ok,
                  ms: res.ms,
                  detail: res.ok ? res.text : res.error,
                });
                setProbing(false);
              }}
            >
              {probing ? "Probing…" : "Probe"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCompare(compareId === active.id ? null : active.id)}
            >
              {compareId === active.id ? "Clear B" : "Set as B"}
            </Button>
            {!active.builtin && (
              <Button type="button" variant="miss" onClick={() => removeCustom(active.id)}>
                Remove custom
              </Button>
            )}
          </div>
          {lastProbe && (
            <p className={`font-mono text-[11px] ${lastProbe.ok ? "text-pass" : "text-miss"}`}>
              {lastProbe.ok ? "ok" : "fail"} · {lastProbe.ms} ms · {lastProbe.detail.slice(0, 160)}
            </p>
          )}
          {compareId && (
            <p className="font-mono text-[11px] text-muted">Compare B = {compareId}</p>
          )}
        </div>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            addCustom({ name, baseUrl, protocol, model, apiKey: key });
          }}
        >
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Add custom</p>
          <input
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <input
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://host/v1"
          />
          <select
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value as Protocol)}
          >
            <option value="openai">OpenAI-compatible</option>
            <option value="anthropic">Anthropic</option>
            <option value="google">Google Gemini</option>
          </select>
          <input
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={model}
            onChange={(e) => setModelDraft(e.target.value)}
            placeholder="model id"
          />
          <input
            type="password"
            className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
            value={key}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="API key (optional if local)"
          />
          <Button type="submit">Admit provider</Button>
        </form>
      </section>
    </div>
  );
}
