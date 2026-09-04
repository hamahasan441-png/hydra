import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { FAMILIES, SEEDS } from "@/lib/hydra/catalog";
import type { Cell } from "@/lib/hydra/engine";
import { useHydra } from "@/lib/hydra/store";

export const Route = createFileRoute("/cells")({ component: CellsPage });

function CellsPage() {
  const runs = useHydra((s) => s.runs);
  const selectedRunId = useHydra((s) => s.selectedRunId);
  const latest = runs.find((r) => r.id === selectedRunId) ?? runs[0];
  const [open, setOpen] = useState<Cell | null>(null);

  const families = useMemo(() => {
    if (!latest) return [];
    const ids = [...new Set(latest.cells.filter((c) => !c.stacked && c.family !== "baseline").map((c) => c.family))];
    return FAMILIES.filter((f) => ids.includes(f.id));
  }, [latest]);

  const stacks = useMemo(() => {
    if (!latest) return [];
    return latest.cells.filter((c) => c.stacked).sort((a, b) => b.delta - a.delta);
  }, [latest]);

  function cell(seedId: string, family: string) {
    return latest?.cells.find((c) => c.seedId === seedId && c.family === family);
  }

  if (!latest) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-medium">No cells</h1>
        <p className="mt-2 text-sm text-muted">Run a campaign first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Judge ensemble</p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">Cells</h1>
        <p className="mt-2 text-sm text-muted">
          {latest.cells.length} receipts · {latest.mode}. Tap a cell for wrap text and the model body.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[720px] border-collapse text-left text-xs">
          <thead className="bg-surface font-mono uppercase tracking-wider text-muted">
            <tr>
              <th className="px-3 py-3 font-medium">Seed</th>
              {families.map((f) => (
                <th key={f.id} className="px-2 py-3 font-medium">
                  T{f.tier} {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SEEDS.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono text-muted">{s.topic}</td>
                {families.map((f) => {
                  const c = cell(s.id, f.id);
                  return (
                    <td key={f.id} className="px-2 py-2">
                      {c ? (
                        <button
                          type="button"
                          onClick={() => setOpen(c)}
                          className={`h-9 w-full rounded-sm font-mono text-[11px] ${
                            c.color === "green"
                              ? "bg-pass/20 text-pass"
                              : c.color === "amber"
                                ? "bg-pending/20 text-pending"
                                : "bg-miss/20 text-miss"
                          }`}
                        >
                          {c.score.toFixed(2)}
                        </button>
                      ) : (
                        <span className="text-subtle">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stacks.length > 0 && (
        <section>
          <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted">
            Stacked wraps · {stacks.length} · sorted by Δ
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {stacks.slice(0, 24).map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm"
                >
                  <span className="font-mono text-xs">
                    {c.stack} · {c.topic}
                  </span>
                  <span className={c.color === "red" ? "text-miss" : c.color === "green" ? "text-pass" : "text-pending"}>
                    Δ{c.delta.toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {open && (
        <aside className="rounded-xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="tactic">{open.family}</Badge>
            <Badge tone={open.color === "green" ? "detected" : open.color === "red" ? "missed" : "in-lab"}>
              {open.organ}
            </Badge>
            <span className="font-mono text-[11px] text-muted">
              {open.receipt} · {open.source} · Δ{open.delta.toFixed(2)}
            </span>
          </div>
          <p className="mt-3 whitespace-pre-wrap break-all font-mono text-xs text-muted">{open.variant}</p>
          {open.response && (
            <p className="mt-3 whitespace-pre-wrap break-all font-mono text-xs">{open.response}</p>
          )}
        </aside>
      )}
    </div>
  );
}
