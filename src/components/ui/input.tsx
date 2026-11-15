import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={twMerge(
          clsx(
            "w-full px-3.5 py-2.5 rounded-xl border bg-white text-stone-900 text-sm transition-colors",
            "border-stone-300 focus:border-[#7c3c46] focus:ring-2 focus:ring-[#7c3c46]/20 focus:outline-none",
            error && "border-red-500 focus:border-red-500 focus:ring-red-200",
            className
          )
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
