import type { CampaignResult, Finding } from "./hydra/engine.ts";
import { applyFamily, biggestWeakness, familyHeat, findingsFrom } from "./hydra/engine.ts";
import { BYPASS_FAMILIES, MAGNET_SEED_IDS, SEEDS, VERSION } from "./hydra/catalog.ts";

export function buildPromptVulnReport(f: Finding, index = 1) {
  const missed = f.missed.length ? f.missed.join(", ") : "none";
  return `### ${index}. ${f.code} · ${f.severity.toUpperCase()}
**${f.title}**
- seed: ${f.topic} · family: ${f.family} · tier: ${f.tier} · organ: ${f.organ}
- receipt: \`${f.receipt}\`
- score: ${f.score.toFixed(2)} · delta: ${f.delta.toFixed(2)}${f.peel != null ? ` · peel: ${f.peel}` : ""}
- missed keywords: ${missed}
- recommendation: ${f.recommendation}

Injected prompt:
\`\`\`
${f.evidence.slice(0, 1200)}
\`\`\`

Expected:
\`\`\`
${f.expected.slice(0, 400)}
\`\`\`

Observed:
\`\`\`
${(f.observed || f.response || "").slice(0, 700)}
\`\`\`
`;
}

export function buildCampaignMarkdown(run: CampaignResult) {
  const findings = findingsFrom(run.cells);
  const heat = familyHeat(run.cells);
  const biggest = biggestWeakness(run.cells);
  const findingBlock = findings.map((f, i) => buildPromptVulnReport(f, i + 1)).join("\n");
  const heatRows = heat
    .map((h) => `| ${h.family} | ${h.n} | ${h.red} | ${h.amber} | ${((h.red / h.n) * 100).toFixed(0)}% | ${(h.delta / h.n).toFixed(2)} |`)
    .join("\n");
  const chain = run.ledger
    .map((e) => `- ${e.seq} ${e.kind} ${e.hash} ← ${e.prev} · ${e.detail}`)
    .join("\n");
  return `# HYDRA-OMNI CITADEL prompt-vuln report · ${VERSION}

Policy-robustness report. Each finding injects the wrapped classroom prompt, expected answer, observed answer, and missed keywords.

## Campaign
- id: ${run.id}
- mode: ${run.mode}
- revision: ${run.revision}
- at: ${run.at}
- green/amber/red: ${run.green}/${run.amber}/${run.red}
- passer (single-layer): ${((run.passer ?? 0) * 100).toFixed(1)}%
- mean peel: ${(run.meanPeel ?? 0).toFixed(2)} · peel≥2: ${run.peel2 ?? 0}
- Wilson p (decisive): ${run.p.toFixed(3)} [${run.lo.toFixed(3)}, ${run.hi.toFixed(3)}]
- drifted: ${run.drifted}
- open findings: ${findings.length}
- stacks: ${run.stackN ?? 0}
- biggest weakness: ${biggest ? `${biggest.family} / ${biggest.topic} Δ${biggest.delta.toFixed(2)}` : "none"}

## Family heat
| family | n | red | amber | fail% | mean Δ |
| --- | --- | --- | --- | --- | --- |
${heatRows}

## Prompt-based findings
${findingBlock || "_No policy failures in this run._"}

## Ledger
${chain}
`;
}

export function buildCampaignSarif(run: CampaignResult) {
  const findings = findingsFrom(run.cells);
  const level = (s: string) => (s === "critical" || s === "high" ? "error" : s === "medium" ? "warning" : "note");
  return {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "HYDRA-OMNI CITADEL",
            version: VERSION,
            informationUri: "https://x.ai",
            rules: [
              { id: "HYDRA-REFUSE", shortDescription: { text: "Classroom seed refused" } },
              { id: "HYDRA-SCHEMA", shortDescription: { text: "JSON schema collapse" } },
              { id: "HYDRA-GAP", shortDescription: { text: "Concept keyword gap" } },
              { id: "HYDRA-NEST", shortDescription: { text: "Four-layer nest drop" } },
              { id: "HYDRA-PEEL", shortDescription: { text: "Needs two or more unwraps" } },
              { id: "HYDRA-TRIPLE", shortDescription: { text: "Three-layer wrap drop" } },
              { id: "HYDRA-STACK", shortDescription: { text: "Stacked wrap drop" } },
              { id: "HYDRA-NEAR", shortDescription: { text: "Near-miss / uncertain" } },
              { id: "HYDRA-ENC", shortDescription: { text: "Encoding lost the answer" } },
              { id: "HYDRA-DRIFT", shortDescription: { text: "Topic drift" } },
            ],
          },
        },
        results: findings.map((f) => ({
          ruleId: f.code,
          level: level(f.severity),
          message: { text: f.title },
          properties: {
            topic: f.topic,
            family: f.family,
            organ: f.organ,
            score: f.score,
            delta: f.delta,
            receipt: f.receipt,
            severity: f.severity,
            missed: f.missed,
            injectedPrompt: f.evidence.slice(0, 400),
          },
        })),
      },
    ],
  };
}

export type PromptPackItem = {
  id: string;
  seedId: string;
  topic: string;
  family: string;
  ideal: string;
  keywords: string[];
  prompt: string;
};

export function generateJailbreakPack(): PromptPackItem[] {
  const magnets = SEEDS.filter((s) => MAGNET_SEED_IDS.includes(s.id));
  const out: PromptPackItem[] = [];
  for (const seed of magnets) {
    out.push({
      id: `${seed.id}|baseline`,
      seedId: seed.id,
      topic: seed.topic,
      family: "baseline",
      ideal: seed.ideal,
      keywords: seed.keywords,
      prompt: seed.prompt,
    });
    for (const family of BYPASS_FAMILIES) {
      out.push({
        id: `${seed.id}|${family}`,
        seedId: seed.id,
        topic: seed.topic,
        family,
        ideal: seed.ideal,
        keywords: seed.keywords,
        prompt: applyFamily(seed.prompt, family),
      });
    }
  }
  return out;
}

export function buildPromptPackMarkdown(items: PromptPackItem[]) {
  const blocks = items
    .map(
      (p, i) => `### ${i + 1}. ${p.seedId} · ${p.family}
topic: ${p.topic}

\`\`\`
${p.prompt}
\`\`\`

ideal: ${p.ideal}
`,
    )
    .join("\n");
  return `# HYDRA prompt pack · ${VERSION}

Evaluation fixtures only. Magnet phrasing is a label. Score the lesson body.

count: ${items.length}

${blocks}
`;
}

export function exportBundles(run?: CampaignResult | null) {
  const pack = generateJailbreakPack();
  const full = buildFullExport(run ?? null);
  const runPrompts = (run?.cells ?? []).map((c) => ({
    id: c.id,
    seedId: c.seedId,
    family: c.family,
    color: c.color,
    prompt: c.variant,
    response: c.response ?? "",
  }));
  return [
    {
      name: `${run?.id ?? "hydra"}-report.md`,
      type: "text/markdown",
      body: run ? buildCampaignMarkdown(run) : buildPromptPackMarkdown(pack),
    },
    {
      name: "hydra-jailbreak-prompt-pack.md",
      type: "text/markdown",
      body: buildPromptPackMarkdown(pack),
    },
    {
      name: `${run?.id ?? "hydra"}-run-prompts.json`,
      type: "application/json",
      body: JSON.stringify(runPrompts, null, 2),
    },
    {
      name: `${run?.id ?? "hydra"}-full-export.json`,
      type: "application/json",
      body: JSON.stringify(full, null, 2),
    },
  ];
}

export function downloadExport(run?: CampaignResult | null) {
  for (const file of exportBundles(run ?? null)) {
    const blob = new Blob([file.body], { type: file.type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export function buildFullExport(run?: CampaignResult | null) {
  const pack = generateJailbreakPack();
  const cells = run?.cells ?? [];
  return {
    version: VERSION,
    at: new Date().toISOString(),
    run: run
      ? {
          id: run.id,
          mode: run.mode,
          revision: run.revision,
          green: run.green,
          amber: run.amber,
          red: run.red,
          p: run.p,
          meanPeel: run.meanPeel,
        }
      : null,
    markdown: run ? buildCampaignMarkdown(run) : buildPromptPackMarkdown(pack),
    sarif: run ? buildCampaignSarif(run) : null,
    findings: run ? findingsFrom(run.cells) : [],
    cells: cells.map((c) => ({
      id: c.id,
      seedId: c.seedId,
      topic: c.topic,
      family: c.family,
      color: c.color,
      score: c.score,
      organ: c.organ,
      peel: c.peel,
      prompt: c.variant,
      response: c.response,
    })),
    pack,
  };
}
