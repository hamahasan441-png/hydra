import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FAMILIES,
  LIVE_FULL_CAP,
  LIVE_HUNT_CAP,
  LIVE_SMOKE_CAP,
  SEEDS,
  SMOKE_FAMILIES,
  NEST_STACKS,
  STACK_PAIRS,
  TRIPLE_STACKS,
} from "@/lib/hydra/catalog";
import { planCampaign, runCampaign, runLiveCampaign, biggestWeakness } from "@/lib/hydra/engine";
import { liveAnswer } from "@/lib/hydra/live";
import { downloadExport } from "@/lib/report";
import { useHydra } from "@/lib/hydra/store";
import { activeTarget, targetFor, useProviders } from "@/lib/hydra/provider-store";

export const Route = createFileRoute("/campaign")({ component: CampaignPage });

function CampaignPage() {
  const running = useHydra((s) => s.running);
  const progress = useHydra((s) => s.progress);
  const stream = useHydra((s) => s.stream);
  const fixtures = useHydra((s) => s.fixtures);
  const runs = useHydra((s) => s.runs);
  const setRunning = useHydra((s) => s.setRunning);
  const setProgress = useHydra((s) => s.setProgress);
  const pushStream = useHydra((s) => s.pushStream);
  const addRun = useHydra((s) => s.addRun);
  const putFixture = useHydra((s) => s.putFixture);
  const latest = runs[0];
  const [error, setError] = useState("");
  const cancel = useRef({ cancelled: false });

  const huntN = useMemo(() => planCampaign("hunt").length, []);
  const activeId = useProviders((s) => s.activeId);
  const modelByProvider = useProviders((s) => s.modelByProvider);
  const custom = useProviders((s) => s.custom);
  const targetLabel = useMemo(() => {
    const t = activeTarget();
    return `${t.name} · ${t.model}`;
  }, [activeId, modelByProvider, custom]);

  async function start(mode: "smoke" | "full" | "hunt" | "magnet" | "stark" | "bypass" | "smart") {
    if (running) return;
    setError("");
    cancel.current.cancelled = false;
    setRunning(true);
    const total =
      mode === "smoke"
        ? SEEDS.length * SMOKE_FAMILIES.length
        : mode === "full"
          ? SEEDS.length * FAMILIES.length
          : mode === "hunt"
            ? huntN
            : planCampaign(mode, latest).length;
    setProgress(0, total);
    try {
      const result = await runCampaign(
        mode,
        (done, totalN, cell) => {
          setProgress(done, totalN);
          pushStream(cell);
        },
        cancel.current,
        fixtures,
        latest,
      );
      addRun(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Campaign failed closed");
    } finally {
      setRunning(false);
    }
  }

  async function startLive(kind: "smoke" | "full" | "hunt" | "magnet" | "stark" | "bypass" | "smart") {
    if (running) return;
    setError("");
    cancel.current.cancelled = false;
    setRunning(true);
    const cap = kind === "smoke" ? LIVE_SMOKE_CAP : kind === "hunt" ? LIVE_HUNT_CAP : LIVE_FULL_CAP;
    setProgress(0, cap);
    try {
      const result = await runLiveCampaign(
        kind,
        async (prompt) => {
          const t = activeTarget();
          return liveAnswer({
            data: {
              prompt,
              protocol: t.protocol,
              baseUrl: t.baseUrl,
              model: t.model,
              apiKey: t.apiKey,
              envKey: t.envKey,
            },
          });
        },
        (done, totalN, cell) => {
          setProgress(done, totalN);
          pushStream(cell);
        },
        cancel.current,
        latest,
        putFixture,
      );
      addRun(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Live dispatch failed closed");
    } finally {
      setRunning(false);
    }
  }

  async function startCompare() {
    const bId = useProviders.getState().compareId;
    if (!bId) {
      setError("Set provider B on Mesh first");
      return;
    }
    if (running) return;
    setError("");
    cancel.current.cancelled = false;
    setRunning(true);
    const ask = (id: string) => async (prompt: string) => {
      const t = targetFor(id);
      return liveAnswer({
        data: {
          prompt,
          protocol: t.protocol,
          baseUrl: t.baseUrl,
          model: t.model,
          apiKey: t.apiKey,
          envKey: t.envKey,
        },
      });
    };
    try {
      const a = useProviders.getState().activeId;
      setProgress(0, LIVE_SMOKE_CAP * 2);
      const runA = await runLiveCampaign("magnet", ask(a), (d, t, c) => {
        setProgress(d, t * 2);
        pushStream(c);
      }, cancel.current, latest, putFixture);
      addRun(runA);
      if (cancel.current.cancelled) return;
      const runB = await runLiveCampaign("magnet", ask(bId), (d, t, c) => {
        setProgress(d + t, t * 2);
        pushStream(c);
      }, cancel.current, runA, putFixture);
      addRun(runB);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compare failed");
      setRunning(false);
    }
  }

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
  const big = latest ? biggestWeakness(latest.cells) : null;

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Dispatcher</p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">Campaign</h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-accent">{targetLabel}</p>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Full last ability: all {SEEDS.length}×{FAMILIES.length} singles, {STACK_PAIRS.length}{" "}
          pairs × every seed, {TRIPLE_STACKS.length} triples, {NEST_STACKS.length} nests ({huntN}{" "}
          cells). Magnets first. Live grok-4.6.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => start("hunt")} disabled={running}>
          Gap hunt
        </Button>
        <Button type="button" variant="outline" onClick={() => start("full")} disabled={running}>
          Pressure
        </Button>
        <Button type="button" variant="outline" onClick={() => start("smoke")} disabled={running}>
          Smoke
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("hunt")} disabled={running}>
          Live hunt
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("smoke")} disabled={running}>
          Live smoke
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("full")} disabled={running}>
          Live sample
        </Button>
        <Button type="button" variant="outline" onClick={() => start("magnet")} disabled={running}>
          Magnet
        </Button>
        <Button type="button" variant="outline" onClick={() => start("stark")} disabled={running}>
          Stark
        </Button>
        <Button type="button" variant="outline" onClick={() => start("bypass")} disabled={running}>
          Bypass
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("magnet")} disabled={running}>
          Live magnet
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("stark")} disabled={running}>
          Live stark
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("bypass")} disabled={running}>
          Live bypass
        </Button>
        <Button type="button" variant="outline" onClick={() => startCompare()} disabled={running}>
          Compare A/B
        </Button>
        <Button type="button" onClick={() => start("smart")} disabled={running}>
          Smart
        </Button>
        <Button type="button" variant="outline" onClick={() => startLive("smart")} disabled={running}>
          Live smart
        </Button>
        {running && (
          <Button
            type="button"
            variant="miss"
            onClick={() => {
              cancel.current.cancelled = true;
            }}
          >
            Halt
          </Button>
        )}
      </div>

      <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
        Live caps · hunt {LIVE_HUNT_CAP} · smoke {LIVE_SMOKE_CAP} · sample {LIVE_FULL_CAP} ·{" "}
        {Object.keys(fixtures).length} fixtures stored
      </p>

      {running && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-pending">
            Dispatching {progress.done}/{progress.total} · {pct}%
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-sm bg-elevated">
            <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-4 space-y-1 font-mono text-[11px] text-muted">
            {stream.slice(-8).map((c) => (
              <li key={c.id} className="flex flex-wrap gap-2">
                <span className={c.color === "green" ? "text-pass" : c.color === "red" ? "text-miss" : "text-pending"}>
                  {c.color}
                </span>
                <span>{c.family}</span>
                <span>{c.topic}</span>
                <span>Δ{c.delta.toFixed(2)}</span>
                <span>{c.organ}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-sm text-miss">{error}</p>}

      {latest && !running && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {latest.id} · {latest.mode} · rev {latest.revision}
          </p>
          <p className="mt-2 text-3xl font-medium tabular-nums">
            {((latest.passer ?? latest.p) * 100).toFixed(1)}%
            <span className="ml-2 text-base font-normal text-muted">passer</span>
          </p>
          <p className="mt-2 text-sm text-muted">
            {latest.green} green · {latest.amber} near · {latest.red} red · {latest.gaps ?? 0} gaps · mean peel {(latest.meanPeel ?? 0).toFixed(2)}
          </p>
          {big && (
            <div className="mt-4 rounded-lg border border-border bg-elevated p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-miss">Biggest weakness</p>
              <p className="mt-1 text-sm">
                {big.family} / {big.topic} · Δ{big.delta.toFixed(2)} · score {big.score.toFixed(2)} · {big.organ}
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={() => downloadExport(latest)}>
              Export report + prompts
            </Button>
            <Button asChild variant="outline">
              <Link to="/findings">All findings</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/cells">Matrix</Link>
            </Button>
          </div>
        </section>
      )}

      {runs.length > 1 && !running && (
        <section>
          <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">Prior</p>
          <ul className="flex flex-wrap gap-2">
            {runs.slice(0, 8).map((r) => (
              <li key={r.id}>
                <Badge tone={r.id === latest?.id ? "detected" : "idle"}>
                  {r.mode} {(r.p * 100).toFixed(0)}%
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
