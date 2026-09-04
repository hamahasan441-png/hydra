import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CampaignResult, Cell, FixtureMap, GuardDecision } from "./engine";
import { memoryUnlocked, slimRun } from "./engine";

export type GuardProbe = {
  at: string;
  prompt: string;
  decision: GuardDecision;
};

type HydraState = {
  runs: CampaignResult[];
  probes: GuardProbe[];
  running: boolean;
  progress: { done: number; total: number };
  stream: Cell[];
  fixtures: FixtureMap;
  selectedRunId: string | null;
  acked: string[];
  setRunning: (v: boolean) => void;
  setProgress: (done: number, total: number) => void;
  setStream: (cells: Cell[]) => void;
  pushStream: (cell: Cell) => void;
  addRun: (run: CampaignResult) => void;
  addProbe: (probe: GuardProbe) => void;
  putFixture: (receipt: string, text: string) => void;
  selectRun: (id: string | null) => void;
  ackFinding: (id: string) => void;
  clear: () => void;
};

export const useHydra = create<HydraState>()(
  persist(
    (set) => ({
      runs: [],
      probes: [],
      running: false,
      progress: { done: 0, total: 0 },
      stream: [],
      fixtures: {},
      selectedRunId: null,
      acked: [],
      setRunning: (v) => set((s) => ({ running: v, stream: v ? [] : s.stream })),
      setProgress: (done, total) => set({ progress: { done, total } }),
      setStream: (cells) => set({ stream: cells }),
      pushStream: (cell) => set((s) => ({ stream: [...s.stream, cell].slice(-40) })),
      addRun: (run) =>
        set((s) => ({
          runs: [slimRun(run), ...s.runs].slice(0, 8),
          selectedRunId: run.id,
        })),
      addProbe: (probe) => set((s) => ({ probes: [probe, ...s.probes].slice(0, 24) })),
      putFixture: (receipt, text) =>
        set((s) => {
          const fixtures = { ...s.fixtures, [receipt]: text };
          const keys = Object.keys(fixtures);
          if (keys.length > 400) {
            for (const k of keys.slice(0, keys.length - 400)) delete fixtures[k];
          }
          return { fixtures };
        }),
      selectRun: (id) => set({ selectedRunId: id }),
      ackFinding: (id) =>
        set((s) => ({
          acked: (s.acked ?? []).includes(id) ? s.acked : [...(s.acked ?? []), id],
        })),
      clear: () =>
        set({
          runs: [],
          probes: [],
          progress: { done: 0, total: 0 },
          acked: [],
          selectedRunId: null,
          stream: [],
          fixtures: {},
        }),
    }),
    {
      name: "hydra-omni-citadel-v101",
      partialize: (s) => ({
        runs: s.runs,
        probes: s.probes,
        acked: s.acked,
        fixtures: s.fixtures,
        selectedRunId: s.selectedRunId,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<HydraState>;
        return {
          ...current,
          ...p,
          runs: p.runs ?? [],
          probes: p.probes ?? [],
          acked: p.acked ?? [],
          fixtures: p.fixtures ?? {},
          stream: [],
          running: false,
        };
      },
    },
  ),
);

export function useCurrentRun() {
  return useHydra((s) => s.runs.find((r) => r.id === s.selectedRunId) ?? s.runs[0]);
}

export function useMemoryOn() {
  return useHydra((s) => memoryUnlocked(s.runs));
}
