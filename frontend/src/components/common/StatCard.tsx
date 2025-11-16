import { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

type StatCardProps = {
  title: string;
  value: string;
  delta?: { value: string; trend: "up" | "down"; label?: string };
  icon?: ReactNode;
  description?: string;
};

export function StatCard({ title, value, delta, icon, description }: StatCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        {delta ? (
          <p
            className={
              delta.trend === "up"
                ? "mt-2 text-xs font-medium text-emerald-600"
                : "mt-2 text-xs font-medium text-red-600"
            }
          >
            {delta.trend === "up" ? "▲" : "▼"} {delta.value}
            {delta.label ? ` ${delta.label}` : null}
          </p>
        ) : null}
        {description ? (
          <CardDescription className="mt-2 text-xs">
            {description}
          </CardDescription>
        ) : null}
      </CardContent>
    </Card>
  );
}

