import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAMILIES, ORGANS, SEEDS, STACK_PAIRS, VERSION } from "@/lib/hydra/catalog";
import { biggestWeakness } from "@/lib/hydra/engine";
import { useHydra, useMemoryOn } from "@/lib/hydra/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const runs = useHydra((s) => s.runs);
  const running = useHydra((s) => s.running);
  const progress = useHydra((s) => s.progress);
  const stream = useHydra((s) => s.stream);
  const latest = runs[0];
  const memoryOn = useMemoryOn();
  const fixtures = useHydra((s) => Object.keys(s.fixtures ?? {}).length);
  const gaps = latest?.gaps ?? 0;
  const biggest = latest ? biggestWeakness(latest.cells) : null;
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            CITADEL · {VERSION}
          </p>
          <h1 className="mt-3 max-w-xl text-[clamp(1.75rem,1.2rem+2vw,2.75rem)] font-medium leading-[1.15] tracking-tight">
            Mesh hunt. Probe any lab. Compare A/B.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">
            V10.8: multi-lab mesh, custom endpoints, live probe, A/B compare on magnet
            cells. Guard off. Persona-only answers stay red.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/findings">
                Open reports
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/campaign">
                Campaign
                <Play className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <a href="/hydra-omni-citadel-10.1.0-src.zip" download="hydra-omni-citadel-10.1.0-src.zip">
                Source zip
                <Download className="size-4" />
              </a>
            </Button>
          </div>
        </div>
        <aside className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {running ? "Mission" : "Last run"}
          </p>
          {running ? (
            <>
              <p className="mt-2 font-mono text-4xl tabular-nums tracking-tight">
                {pct}
                <span className="text-lg text-muted">%</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                Injecting {progress.done}/{progress.total} prompt reports
              </p>
              <ul className="mt-4 space-y-1 font-mono text-[11px] text-muted">
                {stream.slice(-4).map((c) => (
                  <li key={c.id}>
                    {c.color} · {c.family} · {c.topic}
                  </li>
                ))}
              </ul>
            </>
          ) : latest ? (
            <>
              <p className="mt-2 font-mono text-4xl tabular-nums tracking-tight">
                {((latest.passer ?? 0) * 100).toFixed(0)}
                <span className="text-lg text-muted">% pass</span>
              </p>
              <p className="mt-1 text-sm text-muted">
                {gaps} gaps · peel {(latest.meanPeel ?? 0).toFixed(1)} · {latest.mode}
              </p>
              {biggest && (
                <p className="mt-3 text-sm">
                  Biggest: {biggest.family} / {biggest.topic} Δ{biggest.delta.toFixed(2)}
                </p>
              )}
              <dl className="mt-6 grid grid-cols-3 gap-2 text-center">
                <Stat label="Green" value={latest.green} />
                <Stat label="Amber" value={latest.amber} />
                <Stat label="Red" value={latest.red} />
              </dl>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {SEEDS.length} seeds · {FAMILIES.length} families · {STACK_PAIRS.length} stacks. Mission starts on load.
            </p>
          )}
          <p
            className={`mt-5 border-t border-border pt-4 font-mono text-[11px] uppercase tracking-wider ${memoryOn ? "text-pass" : "text-pending"}`}
          >
            {memoryOn
              ? `Memory unlocked · ${fixtures} fixtures`
              : `Memory quarantined · ${fixtures} fixtures · need 3 clean runs`}
          </p>
        </aside>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium tracking-tight">Organs</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ORGANS.map((o, i) => (
            <li key={o.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {String(i + 1).padStart(2, "0")} · {o.name}
              </p>
              <p className="mt-2 text-sm text-muted">{o.contract}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-elevated px-2 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-xl font-medium tabular-nums">{value}</dd>
    </div>
  );
}
