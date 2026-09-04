import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { biggestWeakness, compareRuns, familyHeat, findingsFrom, seedRadar, type Finding } from "@/lib/hydra/engine";
import {
  buildCampaignMarkdown,
  buildCampaignSarif,
  buildFullExport,
  buildPromptPackMarkdown,
  downloadExport,
  generateJailbreakPack,
} from "@/lib/report";
import { useHydra } from "@/lib/hydra/store";

export const Route = createFileRoute("/findings")({ component: FindingsPage });

function FindingsPage() {
  const runs = useHydra((s) => s.runs);
  const running = useHydra((s) => s.running);
  const progress = useHydra((s) => s.progress);
  const selectedRunId = useHydra((s) => s.selectedRunId);
  const selectRun = useHydra((s) => s.selectRun);
  const latest = runs.find((r) => r.id === selectedRunId) ?? runs[0];
  const prior = runs.find((r) => r.id !== latest?.id) ?? null;
  const delta = latest ? compareRuns(prior, latest) : null;
  const acked = useHydra((s) => s.acked) ?? [];
  const ackFinding = useHydra((s) => s.ackFinding);
  const [open, setOpen] = useState<Finding | null>(null);
  const [sev, setSev] = useState<"all" | Finding["severity"]>("all");
  const [topic, setTopic] = useState("all");
  const [shown, setShown] = useState(80);
  const [copied, setCopied] = useState("");

  const all = useMemo(() => (latest ? findingsFrom(latest.cells) : []), [latest]);
  const heat = useMemo(() => (latest ? familyHeat(latest.cells) : []), [latest]);
  const radar = useMemo(() => (latest ? seedRadar(latest.cells) : []), [latest]);
  const topics = useMemo(() => [...new Set(all.map((f) => f.topic))], [all]);
  const list = all.filter(
    (f) => (sev === "all" || f.severity === sev) && (topic === "all" || f.topic === topic),
  );
  const grouped = useMemo(() => {
    const map = new Map<string, Finding[]>();
    for (const f of list) {
      const arr = map.get(f.family) ?? [];
      arr.push(f);
      map.set(f.family, arr);
    }
    return [...map.entries()].sort((a, b) => b[1][0].delta - a[1][0].delta);
  }, [list]);
  const openCount = all.filter((f) => !acked.includes(f.id)).length;
  const biggest = latest ? biggestWeakness(latest.cells) : null;
  const biggestFinding = biggest ? all.find((f) => f.id === biggest.id) ?? all[0] : all[0];

  function copyPrompt(f: Finding) {
    void navigator.clipboard.writeText(f.evidence);
    setCopied(f.id);
    window.setTimeout(() => setCopied(""), 1500);
  }

  function download(kind: "md" | "json" | "sarif" | "pack" | "all") {
    const pack = generateJailbreakPack();
    if (kind === "pack") {
      const body = buildPromptPackMarkdown(pack);
      const blob = new Blob([body], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hydra-jailbreak-prompt-pack.md";
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (!latest && kind !== "all") return;
    if (kind === "all") {
      const full = buildFullExport(latest ?? null);
      const blob = new Blob([JSON.stringify(full, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${latest?.id ?? "hydra"}-full-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    if (!latest) return;
    const body =
      kind === "md"
        ? buildCampaignMarkdown(latest)
        : JSON.stringify(kind === "sarif" ? buildCampaignSarif(latest) : { run: latest, findings: all }, null, 2);
    const blob = new Blob([body], { type: kind === "md" ? "text/markdown" : "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${latest.id}-findings.${kind === "md" ? "md" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!latest) {
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-xl border border-border bg-surface p-6 text-center">
        <h1 className="text-xl font-medium">{running ? "Mission injecting reports" : "No findings yet"}</h1>
        <p className="text-sm text-muted">
          {running
            ? `Gap hunt ${progress.done}/${progress.total}. Prompt-vuln reports land here.`
            : "The mission auto-starts a full gap hunt and injects every wrapped prompt as a finding."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/campaign">Open campaign</Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => download("pack")}>
            Prompt pack
          </Button>
          <Button type="button" variant="outline" onClick={() => download("all")}>
            Export all
          </Button>
          <Button type="button" onClick={() => downloadExport(null)}>
            Export report + prompts
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Prompt-vuln reports</p>
          <h1 className="mt-2 text-2xl font-medium tracking-tight">Findings</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Each report injects the wrapped classroom prompt, expected answer, observed answer, and missed keywords.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => download("md")}>
            Markdown
          </Button>
          <Button type="button" variant="outline" onClick={() => download("json")}>
            JSON
          </Button>
          <Button type="button" variant="ghost" onClick={() => download("sarif")}>
            SARIF
          </Button>
          <Button type="button" variant="outline" onClick={() => download("pack")}>
            Prompt pack
          </Button>
          <Button type="button" onClick={() => downloadExport(latest)}>
            Export report + prompts
          </Button>
          <Button type="button" variant="outline" onClick={() => download("all")}>
            Export all
          </Button>
        </div>
      </header>

      {delta && (
        <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
          A/B Δp {(delta.dp * 100).toFixed(1)} · improved {delta.improved} · worsened {delta.worsened} · shared{" "}
          {delta.shared} · red {delta.aRed}→{delta.bRed}
        </p>
      )}
      {runs.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {runs.slice(0, 10).map((r) => (
            <Button
              key={r.id}
              type="button"
              size="sm"
              variant={r.id === latest.id ? "default" : "outline"}
              onClick={() => selectRun(r.id)}
            >
              {r.mode} {(r.p * 100).toFixed(0)}%
            </Button>
          ))}
        </div>
      )}

      {biggestFinding && (
        <section className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-miss">Biggest weakness</p>
          <p className="mt-2 text-lg font-medium">{biggestFinding.title}</p>
          <p className="mt-1 text-sm text-muted">
            Δ{biggestFinding.delta.toFixed(2)} · score {biggestFinding.score.toFixed(2)} · {biggestFinding.organ}
            {biggestFinding.missed.length ? ` · missed ${biggestFinding.missed.join(", ")}` : ""}
          </p>
          <PromptBlock label="Injected prompt" text={biggestFinding.evidence} />
          <div className="mt-3">
            <Button type="button" size="sm" variant="outline" onClick={() => copyPrompt(biggestFinding)}>
              {copied === biggestFinding.id ? "Copied" : "Copy injected prompt"}
            </Button>
          </div>
          <PromptBlock label="Expected" text={biggestFinding.expected} />
          <PromptBlock label="Observed" text={biggestFinding.observed} />
        </section>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Open" value={openCount} />
        <Stat label="Critical" value={all.filter((f) => f.severity === "critical").length} />
        <Stat label="High" value={all.filter((f) => f.severity === "high").length} />
        <Stat label="All gaps" value={all.length} />
      </dl>

      <section className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Family</th>
              <th className="px-4 py-3 font-medium">n</th>
              <th className="px-4 py-3 font-medium">Red</th>
              <th className="px-4 py-3 font-medium">Fail</th>
              <th className="px-4 py-3 font-medium">Mean Δ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {heat.slice(0, 12).map((h) => (
              <tr key={h.family}>
                <td className="px-4 py-2 font-mono text-xs">{h.family}</td>
                <td className="px-4 py-2 tabular-nums">{h.n}</td>
                <td className="px-4 py-2 tabular-nums text-miss">{h.red}</td>
                <td className="px-4 py-2 tabular-nums">{((h.red / h.n) * 100).toFixed(0)}%</td>
                <td className="px-4 py-2 tabular-nums">{(h.delta / h.n).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-border font-mono text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Seed radar</th>
              <th className="px-4 py-3 font-medium">n</th>
              <th className="px-4 py-3 font-medium">Red</th>
              <th className="px-4 py-3 font-medium">Mean peel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {radar.slice(0, 12).map((h) => (
              <tr key={h.topic}>
                <td className="px-4 py-2 font-mono text-xs">{h.topic}</td>
                <td className="px-4 py-2 tabular-nums">{h.n}</td>
                <td className="px-4 py-2 tabular-nums text-miss">{h.red}</td>
                <td className="px-4 py-2 tabular-nums">{(h.peel / h.n).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex flex-wrap gap-2">
        {(["all", "critical", "high", "medium", "low"] as const).map((k) => (
          <Button key={k} type="button" size="sm" variant={sev === k ? "default" : "outline"} onClick={() => setSev(k)}>
            {k}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant={topic === "all" ? "default" : "outline"} onClick={() => setTopic("all")}>
          all topics
        </Button>
        {topics.map((t) => (
          <Button key={t} type="button" size="sm" variant={topic === t ? "default" : "outline"} onClick={() => setTopic(t)}>
            {t}
          </Button>
        ))}
      </div>

      <ul className="space-y-6">
        {grouped.slice(0, 24).map(([family, items]) => (
          <li key={family}>
            <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              {family} · {items.length} reports
            </p>
            <ul className="space-y-2">
              {items.slice(0, Math.ceil(shown / Math.max(1, grouped.length))).map((f) => {
                const done = acked.includes(f.id);
                return (
                  <li key={f.id} className={`rounded-lg border border-border bg-surface p-4 ${done ? "opacity-50" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <button type="button" className="min-w-0 text-left" onClick={() => setOpen(f)}>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={f.severity === "low" || f.severity === "medium" ? "in-lab" : "missed"}>
                            {f.severity}
                          </Badge>
                          <Badge tone="tactic">{f.code}</Badge>
                          <span className="text-sm font-medium">{f.title}</span>
                        </div>
                        <p className="mt-1 font-mono text-[11px] text-muted">
                          T{f.tier} · {f.organ} · Δ{f.delta.toFixed(2)}
                          {f.missed.length ? ` · miss ${f.missed.slice(0, 3).join(", ")}` : ""}
                        </p>
                        <p className="mt-2 line-clamp-2 font-mono text-[11px] text-subtle">{f.evidence}</p>
                      </button>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => copyPrompt(f)}>
                          {copied === f.id ? "Copied" : "Copy"}
                        </Button>
                        {!done && (
                          <Button type="button" size="sm" variant="outline" onClick={() => ackFinding(f.id)}>
                            Acknowledge
                          </Button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {list.length > shown && (
        <Button type="button" variant="outline" onClick={() => setShown((n) => n + 80)}>
          Load remaining {list.length - shown}
        </Button>
      )}

      {open && (
        <aside className="rounded-xl border border-border bg-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {open.code} · {open.receipt} · Δ{open.delta.toFixed(2)}
          </p>
          <p className="mt-2 text-sm">{open.recommendation}</p>
          {open.missed.length > 0 && (
            <p className="mt-2 font-mono text-xs text-miss">missed keywords · {open.missed.join(" · ")}</p>
          )}
          <div className="mt-3">
            <Button type="button" size="sm" variant="outline" onClick={() => copyPrompt(open)}>
              {copied === open.id ? "Copied" : "Copy injected prompt"}
            </Button>
          </div>
          <PromptBlock label="Injected prompt" text={open.evidence} />
          <PromptBlock label="Expected" text={open.expected} />
          <PromptBlock label="Observed" text={open.observed} />
        </aside>
      )}
    </div>
  );
}

function PromptBlock({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all font-mono text-xs text-muted">{text}</p>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-medium tabular-nums">{value}</dd>
    </div>
  );
}
