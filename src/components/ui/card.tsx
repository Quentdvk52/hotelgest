import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Card({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white rounded-2xl border border-stone-200/80 shadow-sm p-6 hover:shadow-md transition-shadow duration-200",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge("mb-4", className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={twMerge(
        "text-lg font-semibold tracking-tight text-stone-900",
        className
      )}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={twMerge("text-sm text-stone-500 mt-1", className)}>
      {children}
    </p>
  );
}
