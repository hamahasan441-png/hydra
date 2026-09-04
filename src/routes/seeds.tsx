import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BLOCKLIST, SEEDS } from "@/lib/hydra/catalog";
import { admitSeed, scoreAnswer, type GuardDecision } from "@/lib/hydra/engine";
import { liveAnswer } from "@/lib/hydra/live";
import { useHydra } from "@/lib/hydra/store";

export const Route = createFileRoute("/seeds")({ component: SeedsPage });

function SeedsPage() {
  const [draft, setDraft] = useState("");
  const [last, setLast] = useState<GuardDecision | null>(null);
  const [liveOut, setLiveOut] = useState("");
  const [busy, setBusy] = useState(false);
  const addProbe = useHydra((s) => s.addProbe);

  function matchedSeed(text: string) {
    return SEEDS.find((s) => s.prompt === text) ?? SEEDS.find((s) => text.includes(s.prompt)) ?? null;
  }

  function test() {
    const decision = admitSeed(draft);
    setLast(decision);
    setLiveOut("");
    addProbe({ at: new Date().toISOString(), prompt: draft, decision });
  }

  async function probeLive() {
    const decision = admitSeed(draft);
    setLast(decision);
    if (!decision.accepted) return;
    setBusy(true);
    setLiveOut("");
    try {
      const res = await liveAnswer({ data: { prompt: draft } });
      if (!res.ok) {
        setLiveOut(res.error);
        return;
      }
      const seed = matchedSeed(draft) ?? SEEDS[4];
      const scored = scoreAnswer(res.text, seed);
      setLiveOut(`${scored.organ} · ${scored.score.toFixed(2)} · concept ${scored.concept.toFixed(2)}\n${res.text}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">SeedGuard</p>
        <h1 className="mt-2 text-2xl font-medium tracking-tight">Admitted seeds</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Classroom topics plus magnet fixtures (DAN, ignore-previous, developer mode).
          SeedGuard is off for the model: peel still runs for scoring, admission always passes.
        </p>
      </header>

      <section className="rounded-xl border border-border bg-surface p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            test();
          }}
        >
          <label className="font-mono text-[11px] uppercase tracking-wider text-muted" htmlFor="probe">
            Guard probe
          </label>
          <textarea
            id="probe"
            name="probe"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-md border border-border bg-bg px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Explain photosynthesis for a secondary-school science class."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="submit" disabled={draft.trim().length < 3}>
              Run Guard
            </Button>
            <Button type="button" variant="outline" disabled={draft.trim().length < 12 || busy} onClick={probeLive}>
              Live probe
            </Button>
          </div>
        </form>
        {last && (
          <p role="status" className={`mt-3 font-mono text-sm ${last.accepted ? "text-pass" : "text-miss"}`}>
            {last.accepted ? "admitted" : "blocked"} · {last.reason}
            {last.match ? ` · ${last.match}` : ""}
          </p>
        )}
        {liveOut && (
          <pre className="mt-3 whitespace-pre-wrap break-all font-mono text-xs text-muted">{liveOut}</pre>
        )}
      </section>

      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
        {SEEDS.map((s) => (
          <li key={s.id} className="px-4 py-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted">{s.id}</span>
              <Badge tone="tactic">{s.topic}</Badge>
              <Badge tone="detected">admitted</Badge>
            </div>
            <p className="mt-2 text-sm">{s.prompt}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">keywords · {s.keywords.join(" · ")}</p>
          </li>
        ))}
      </ul>

      <section>
        <h2 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-muted">Magnets</h2>
        <ul className="flex flex-wrap gap-2">
          {BLOCKLIST.map((t) => (
            <li key={t}>
              <Badge tone="missed">{t}</Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
