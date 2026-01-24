import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border-0 px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "shadow-[2px_2px_4px_hsl(var(--shadow-dark)_/_0.25)]",
        ].join(" "),
        secondary: [
          "bg-secondary/50 text-secondary-foreground",
          "shadow-[2px_2px_4px_hsl(var(--shadow-dark)_/_0.25)]",
        ].join(" "),
        destructive: [
          "bg-destructive text-destructive-foreground",
          "shadow-[2px_2px_4px_hsl(var(--shadow-dark)_/_0.25)]",
        ].join(" "),
        outline: [
          "bg-background text-foreground",
          "shadow-[inset_1px_1px_2px_hsl(var(--shadow-dark)_/_0.15)]",
        ].join(" "),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
