import * as React from "react";
import { cn } from "./utils";

const Table = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto rounded-xl border bg-white shadow-sm">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);

const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn("[&_tr]:border-b bg-slate-50", className)} {...props} />
);

const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

const TableFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot
    className={cn(
      "border-t bg-slate-50 font-medium text-slate-900",
      className
    )}
    {...props}
  />
);

const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      "border-b transition hover:bg-slate-50 data-[state=selected]:bg-slate-100",
      className
    )}
    {...props}
  />
);

const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
      className
    )}
    {...props}
  />
);

const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td
    className={cn("p-4 align-middle text-sm text-slate-700", className)}
    {...props}
  />
);

const TableCaption = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
};

