import { ReactNode } from "react";
import { cn } from "./utils";

type ResizablePanelGroupProps = {
  children: ReactNode;
  direction?: "horizontal" | "vertical";
  className?: string;
};

export function ResizablePanelGroup({
  children,
  direction = "horizontal",
  className
}: ResizablePanelGroupProps) {
  return (
    <div
      className={cn(
        "flex rounded-xl border bg-white",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
}

type ResizablePanelProps = {
  children: ReactNode;
  defaultSize?: number;
  className?: string;
};

export function ResizablePanel({
  children,
  className
}: ResizablePanelProps) {
  return <div className={cn("flex-1 p-6", className)}>{children}</div>;
}

export function ResizableHandle() {
  return (
    <div className="mx-1 flex w-px cursor-col-resize select-none items-center bg-slate-200" />
  );
}

