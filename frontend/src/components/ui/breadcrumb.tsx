import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "./utils";

const Breadcrumb = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <nav
    className={cn("flex items-center text-sm text-muted-foreground", className)}
    aria-label="breadcrumbs"
    {...props}
  />
);

const BreadcrumbList = ({
  className,
  ...props
}: React.OlHTMLAttributes<HTMLOListElement>) => (
  <ol className={cn("flex flex-wrap items-center gap-1", className)} {...props} />
);

const BreadcrumbItem = ({
  className,
  ...props
}: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("inline-flex items-center gap-1", className)} {...props} />
);

const BreadcrumbSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-muted-foreground/70", className)} {...props}>
    <ChevronRight className="h-4 w-4" />
  </span>
);

const BreadcrumbLink = ({
  className,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
  <a
    className={cn(
      "font-medium text-muted-foreground transition-colors hover:text-foreground",
      className
    )}
    {...props}
  />
);

const BreadcrumbPage = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-semibold text-foreground", className)} {...props} />
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage
};

