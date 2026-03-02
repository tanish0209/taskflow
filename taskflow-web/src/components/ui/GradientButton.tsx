"use client";

import React from "react";
import Link from "next/link";

interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "filled" | "outline";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function GradientButton({
  children,
  variant = "filled",
  size = "md",
  href,
  className = "",
  ...props
}: GradientButtonProps) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const base =
    "inline-block font-semibold rounded-lg cursor-pointer transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    filled:
      "bg-linear-to-b from-amber-100 via-orange-200 to-orange-300 text-orange-900 shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.97]",
    outline:
      "border-2 border-orange-300 text-orange-500 bg-transparent hover:bg-linear-to-b hover:from-amber-100 hover:via-orange-200 hover:to-orange-300 hover:text-orange-900 active:scale-[0.97]",
  };

  const classes = `${base} ${sizeClasses[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
