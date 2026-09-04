import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Flag, GitCommitHorizontal, Grid3x3, Home, Play, Sprout, Cable } from "lucide-react";
import { cn } from "@/lib/utils";
import { VERSION } from "@/lib/hydra/catalog";
import { startMission } from "@/lib/hydra/mission";
import { useHydra } from "@/lib/hydra/store";

const NAV = [
  { to: "/", label: "Omni", icon: Home },
  { to: "/seeds", label: "Seeds", icon: Sprout },
  { to: "/campaign", label: "Run", icon: Play },
  { to: "/cells", label: "Cells", icon: Grid3x3 },
  { to: "/findings", label: "Findings", icon: Flag },
  { to: "/ledger", label: "Ledger", icon: GitCommitHorizontal },
  { to: "/providers", label: "Mesh", icon: Cable },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const running = useHydra((s) => s.running);
  const progress = useHydra((s) => s.progress);
  const latest = useHydra((s) => s.runs[0]);
  const gaps = latest?.gaps ?? 0;

  useEffect(() => {
    void startMission();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-fg"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-sm border border-border bg-surface font-mono text-[11px]">
              H
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-medium tracking-tight">
                Hydra Omni
              </span>
              <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Citadel {VERSION}
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-10 items-center gap-2 rounded-sm px-3 text-sm transition-colors duration-150",
                    active ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <item.icon className="size-3.5" strokeWidth={1.75} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <span
            className={cn(
              "hidden font-mono text-[11px] uppercase tracking-wider sm:inline",
              running ? "text-pending" : latest ? "text-pass" : "text-muted",
            )}
          >
            {running
              ? `Mission ${progress.done}/${progress.total || "…"}`
              : latest
                ? `pass ${(latest.passer * 100).toFixed(0)}% · ${gaps} gaps`
                : "Idle"}
          </span>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-4 pb-24 pt-8 md:pb-12">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 backdrop-blur-sm md:hidden"
        aria-label="Mobile"
      >
        <div className="grid grid-cols-6">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px]",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <item.icon className="size-4" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
