import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        idle: "bg-elevated text-muted",
        "in-lab": "bg-pending/15 text-pending",
        detected: "bg-pass/15 text-pass",
        missed: "bg-miss/15 text-miss",
        tactic: "bg-elevated text-fg",
      },
    },
    defaultVariants: { tone: "idle" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
