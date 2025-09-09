import * as React from "react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["rounded-xl border p-4", className].filter(Boolean).join(" ")} {...props} />;
}
export function CardHeader(props: React.HTMLAttributes<HTMLDivElement>) { return <div className="mb-2" {...props} />; }
export function CardTitle(props: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className="text-lg font-semibold" {...props} />; }
export function CardContent(props: React.HTMLAttributes<HTMLDivElement>) { return <div {...props} />; }
