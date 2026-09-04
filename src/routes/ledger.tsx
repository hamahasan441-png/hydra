import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { buildCampaignMarkdown, buildCampaignSarif } from "@/lib/report";
import { useHydra } from "@/lib/hydra/store";

export const Route = createFileRoute("/ledger")({ component: LedgerPage });

function LedgerPage() {
  const runs = useHydra((s) => s.runs);
  const selectedRunId = useHydra((s) => s.selectedRunId);
  const selectRun = useHydra((s) => s.selectRun);
  const clear = useHydra((s) => s.clear);
  const latest = runs.find((r) => r.id === selectedRunId) ?? runs[0];

  function download(kind: "md" | "json" | "sarif") {
    if (!latest) return;
    const body =
      kind === "md"
        ? buildCampaignMarkdown(latest)
        : JSON.stringify(kind === "sarif" ? buildCampaignSarif(latest) : latest, null, 2);
    const blob = new Blob([body], { type: kind === "md" ? "text/markdown" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${latest.id}.${kind === "md" ? "md" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Hash chain</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">Ledger</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" disabled={!latest} onClick={() => download("md")}>
            Markdown
          </Button>
          <Button type="button" variant="outline" disabled={!latest} onClick={() => download("json")}>
            JSON
          </Button>
          <Button type="button" variant="ghost" disabled={!latest} onClick={() => download("sarif")}>
            SARIF
          </Button>
          <Button type="button" variant="ghost" onClick={clear}>
            Clear
          </Button>
        </div>
      </header>

      {runs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {runs.map((r) => (
            <Button
              key={r.id}
              type="button"
              size="sm"
              variant={r.id === latest?.id ? "default" : "outline"}
              onClick={() => selectRun(r.id)}
            >
              {r.mode} {(r.p * 100).toFixed(0)}%
            </Button>
          ))}
        </div>
      )}

      {!latest ? (
        <p className="text-sm text-muted">No signed events. Run a campaign.</p>
      ) : (
        <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {latest.ledger.map((e) => (
            <li key={e.seq} className="px-4 py-3 font-mono text-[11px] leading-relaxed">
              <span className="text-muted">{String(e.seq).padStart(3, "0")}</span>
              <span className="mx-2 text-fg">{e.kind}</span>
              <span className="text-subtle">{e.hash}</span>
              <p className="mt-1 truncate text-muted">{e.detail}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
