import * as React from "react";

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ScrollArea({ className, ...props }: ScrollAreaProps) {
  return (
    <div
      className={["overflow-auto", className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
