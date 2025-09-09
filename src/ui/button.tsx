import * as React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={["inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium border", className].filter(Boolean).join(" ")}
      {...props}
    />
  )
);
Button.displayName = "Button";
