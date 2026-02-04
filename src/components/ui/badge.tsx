import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        success: "border-transparent bg-success text-success-foreground hover:bg-success/90",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/90",
        muted: "border-transparent bg-muted text-muted-foreground",
        // Subtle variants for softer backgrounds (used in confidence badges, status indicators)
        "success-subtle": "border-success-subtle-border bg-success-subtle text-success-subtle-foreground",
        "warning-subtle": "border-warning-subtle-border bg-warning-subtle text-warning-subtle-foreground",
        "destructive-subtle": "border-destructive-subtle-border bg-destructive-subtle text-destructive-subtle-foreground",
        "primary-subtle": "border-primary-subtle-border bg-primary-subtle text-primary-subtle-foreground",
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
