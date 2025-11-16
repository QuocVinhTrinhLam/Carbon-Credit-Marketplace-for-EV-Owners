import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../ui/breadcrumb";

type PageHeaderProps = {
  title: string;
  description?: string;
  trail?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, trail, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b bg-white px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="space-y-3">
        {trail && trail.length > 0 ? (
          <Breadcrumb>
            <BreadcrumbList>
              {trail.map((item, index) => (
                <BreadcrumbItem key={item.label}>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                  {index < trail.length - 1 ? <BreadcrumbSeparator /> : null}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </div>
  );
}

