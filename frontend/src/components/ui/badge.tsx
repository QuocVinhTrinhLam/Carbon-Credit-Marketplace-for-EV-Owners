import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-brand-foreground focus:ring-brand",
        secondary:
          "border-transparent bg-slate-200 text-slate-900 focus:ring-slate-200",
        outline: "border-current text-slate-700",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 focus:ring-emerald-200",
        destructive:
          "border-transparent bg-red-100 text-red-700 focus:ring-red-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

