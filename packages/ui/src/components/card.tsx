import React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "grunge" | "neon" | "toxic" | "gold";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-[#0a0a0a] border-2 border-[#222] shadow-[6px_6px_0_#000]",
      grunge: "bg-[#080808] border-4 border-white shadow-[10px_10px_0_#000]",
      neon: "bg-[#050d08] border-2 border-[#00ff66] shadow-[8px_8px_0_rgba(0,255,102,0.2)]",
      toxic: "bg-[#0d0508] border-2 border-[#ff0055] shadow-[8px_8px_0_rgba(255,0,85,0.2)]",
      gold: "bg-[#0a0802] border-2 border-[#d4af37] shadow-[8px_8px_0_rgba(212,175,55,0.2)]",
    };

    return (
      <div
        ref={ref}
        className={cn("p-6 text-white transition-all", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-mono font-black text-xl uppercase tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs font-mono text-gray-400 leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center pt-4 border-t border-[#222] mt-4 font-mono text-xs", className)} {...props} />;
}
