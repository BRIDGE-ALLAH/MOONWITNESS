import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { sovereignSound } from "@local-git/ui";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, variant = "default", size = "default", onClick, onMouseEnter, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm text-xs font-mono font-bold tracking-wider ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 uppercase";

    const variantStyles = {
      default: "bg-cyan-500 text-black border border-cyan-400 hover:bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.35)]",
      destructive: "bg-rose-600 text-white border border-rose-500 hover:bg-rose-500 shadow-[0_0_12px_rgba(255,0,85,0.35)]",
      outline: "border border-zinc-700 bg-black/40 text-zinc-100 hover:border-cyan-400 hover:text-cyan-300",
      secondary: "bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700",
      ghost: "text-zinc-400 hover:bg-white/5 hover:text-white",
      link: "text-cyan-400 underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3",
      lg: "h-11 px-8 text-sm",
      icon: "h-9 w-9",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sovereignSound.playClick("desktop");
      if (onClick) onClick(e);
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      sovereignSound.playHover("desktop");
      if (onMouseEnter) onMouseEnter(e);
    };

    return (
      <Comp
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        onClick={handleClick as any}
        onMouseEnter={handleMouseEnter as any}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
