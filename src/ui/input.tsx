import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={["h-9 w-full rounded-md border px-3 text-sm", className].filter(Boolean).join(" ")}
      {...props}
    />
  )
);
Input.displayName = "Input";
