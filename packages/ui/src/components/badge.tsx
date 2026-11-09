import React from "react";
import { cn } from "../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lime" | "toxic" | "gold" | "cyan" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#222] text-white border-[#444]",
      lime: "bg-[#00ff66] text-black border-black font-black",
      toxic: "bg-[#ff0055] text-white border-black font-black",
      gold: "bg-[#d4af37] text-black border-black font-black",
      cyan: "bg-[#00f0ff] text-black border-black font-black",
      outline: "bg-transparent text-white border-current",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-mono uppercase tracking-wider border select-none",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

