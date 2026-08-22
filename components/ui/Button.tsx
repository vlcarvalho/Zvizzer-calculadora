import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-foreground hover:bg-accent-strong active:scale-[0.98] disabled:opacity-40 disabled:hover:bg-accent",
  secondary:
    "bg-surface-2 text-foreground border border-border hover:bg-border active:scale-[0.98] disabled:opacity-40",
  ghost: "bg-transparent text-muted hover:text-foreground",
  danger: "bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", fullWidth = true, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-150",
        fullWidth && "w-full",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
