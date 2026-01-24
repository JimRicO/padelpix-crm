import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border-0 bg-background px-4 py-3 text-sm ring-offset-background",
        "shadow-[inset_2px_2px_4px_hsl(var(--shadow-dark)_/_0.3),_inset_-1px_-1px_2px_hsl(var(--shadow-light)_/_0.1)]",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-shadow duration-200",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
