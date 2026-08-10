import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[96px] w-full rounded-[14px] border border-white/10 bg-[#050505]/85 px-4 py-3 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] placeholder:text-[#71717A] transition-all duration-300 focus-visible:border-[#FF6A00]/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FF6A00]/10 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };