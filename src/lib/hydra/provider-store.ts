import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUILTIN_PROVIDERS, type Protocol, type ProviderDef } from "./providers";

export type CustomProvider = ProviderDef & {
  apiKey: string;
};

type ProbeRow = { at: string; ok: boolean; ms: number; detail: string } | null;

type ProviderState = {
  activeId: string;
  compareId: string | null;
  lastProbe: ProbeRow;
  modelByProvider: Record<string, string>;
  keys: Record<string, string>;
  custom: CustomProvider[];
  setActive: (id: string) => void;
  setCompare: (id: string | null) => void;
  setProbe: (row: ProbeRow) => void;
  setModel: (providerId: string, model: string) => void;
  setKey: (providerId: string, key: string) => void;
  addCustom: (input: { name: string; baseUrl: string; protocol: Protocol; model: string; apiKey: string }) => void;
  removeCustom: (id: string) => void;
};

export const useProviders = create<ProviderState>()(
  persist(
    (set) => ({
      activeId: "xai",
      compareId: null,
      lastProbe: null,
      modelByProvider: Object.fromEntries(BUILTIN_PROVIDERS.map((p) => [p.id, p.models[0].id])),
      keys: {},
      custom: [],
      setActive: (id) => set({ activeId: id }),
      setCompare: (id) => set({ compareId: id }),
      setProbe: (row) => set({ lastProbe: row }),
      setModel: (providerId, model) =>
        set((s) => ({ modelByProvider: { ...s.modelByProvider, [providerId]: model } })),
      setKey: (providerId, key) => set((s) => ({ keys: { ...s.keys, [providerId]: key } })),
      addCustom: (input) =>
        set((s) => {
          const id = `custom-${Date.now().toString(36)}`;
          const def: CustomProvider = {
            id,
            name: input.name || "Custom",
            protocol: input.protocol,
            baseUrl: input.baseUrl.replace(/\/$/, ""),
            envKey: "",
            models: [{ id: input.model, label: input.model }],
            builtin: false,
            apiKey: input.apiKey,
          };
          return {
            custom: [...s.custom, def],
            activeId: id,
            modelByProvider: { ...s.modelByProvider, [id]: input.model },
            keys: { ...s.keys, [id]: input.apiKey },
          };
        }),
      removeCustom: (id) =>
        set((s) => ({
          custom: s.custom.filter((c) => c.id !== id),
          activeId: s.activeId === id ? "xai" : s.activeId,
          compareId: s.compareId === id ? null : s.compareId,
        })),
    }),
    {
      name: "hydra-providers-v108",
      partialize: (s) => ({
        activeId: s.activeId,
        compareId: s.compareId,
        modelByProvider: s.modelByProvider,
        keys: s.keys,
        custom: s.custom,
      }),
    },
  ),
);

export function listProviders(): ProviderDef[] {
  const custom = useProviders.getState().custom;
  return [...BUILTIN_PROVIDERS, ...custom];
}

export function targetFor(id?: string | null) {
  const s = useProviders.getState();
  const all = [...BUILTIN_PROVIDERS, ...s.custom];
  const p = all.find((x) => x.id === (id || s.activeId)) ?? BUILTIN_PROVIDERS[0];
  const model = s.modelByProvider[p.id] ?? p.models[0]?.id ?? "grok-4.6";
  const apiKey = s.keys[p.id] ?? ("apiKey" in p ? String((p as CustomProvider).apiKey ?? "") : "");
  return {
    providerId: p.id,
    name: p.name,
    protocol: p.protocol,
    baseUrl: p.baseUrl,
    model,
    apiKey,
    envKey: p.envKey,
  };
}

export function activeTarget() {
  return targetFor(useProviders.getState().activeId);
}
