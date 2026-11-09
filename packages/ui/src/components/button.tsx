import React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "toxic" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyle =
      "inline-flex items-center justify-center font-mono font-bold uppercase transition-all duration-100 disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-2 select-none";

    const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary: "bg-[#00ff66] text-black border-black shadow-[4px_4px_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000]",
      secondary: "bg-[#111] text-white border-[#333] shadow-[4px_4px_0_#000] hover:border-white hover:text-white",
      toxic: "bg-[#ff0055] text-white border-black shadow-[4px_4px_0_#000] hover:bg-[#e6004c]",
      gold: "bg-[#d4af37] text-black border-black shadow-[4px_4px_0_#000] hover:bg-[#f4ff00]",
      outline: "bg-transparent text-white border-current hover:bg-white hover:text-black",
      ghost: "border-transparent bg-transparent text-gray-300 hover:text-white hover:bg-[#1a1a1a]",
    };

    const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-7 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyle, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

