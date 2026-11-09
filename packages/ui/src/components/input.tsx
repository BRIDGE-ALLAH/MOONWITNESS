import React from "react";
import { cn } from "../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", style, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        style={{
          display: "flex",
          height: "40px",
          width: "100%",
          background: "var(--panel2, #050505)",
          color: "var(--text, #ffffff)",
          border: "2px solid var(--line2, #333)",
          borderRadius: "var(--radius, 0px)",
          padding: "8px 12px",
          fontSize: "12px",
          fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
          outline: "none",
          transition: "border-color 0.15s, background 0.15s",
          ...style,
        }}
        className={cn("ui-input", className)}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
