import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border-0 bg-background px-4 py-2 text-base ring-offset-background",
          "shadow-[inset_3px_3px_6px_hsl(var(--shadow-dark)_/_0.4),_inset_-3px_-3px_6px_hsl(var(--shadow-light)_/_0.6)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "transition-shadow duration-200",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
