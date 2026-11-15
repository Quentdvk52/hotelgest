import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";

  const variants = {
    primary: "bg-[#7c3c46] hover:bg-[#68353d] text-white focus:ring-[#7c3c46] shadow-sm",
    secondary: "bg-[#f5e8e8] hover:bg-[#edd5d6] text-[#582f36] focus:ring-[#7c3c46]",
    outline: "border border-stone-300 hover:bg-stone-100 text-stone-800 focus:ring-stone-400",
    ghost: "hover:bg-stone-100 text-stone-700",
    gold: "bg-[#d9a844] hover:bg-[#be8933] text-stone-950 font-semibold focus:ring-[#d9a844] shadow-sm",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 min-h-[32px]",
    md: "text-sm px-4 py-2.5 min-h-[42px]",
    lg: "text-base px-6 py-3.5 min-h-[48px]",
  };

  return (
    <button
      className={twMerge(clsx(base, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
}
