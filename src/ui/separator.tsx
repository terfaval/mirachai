import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <hr
      className={["my-6 border-t", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
