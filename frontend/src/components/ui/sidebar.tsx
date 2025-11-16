import { NavLink } from "react-router-dom";
import { cn } from "./utils";

export type SidebarItem = {
  to: string;
  label: string;
  icon?: React.ReactNode;
  end?: boolean;
};

type SidebarProps = {
  items: SidebarItem[];
  footer?: React.ReactNode;
  className?: string;
};

export function Sidebar({ items, footer, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-white/70 backdrop-blur",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <span className="text-lg font-semibold text-brand-dark">
          Carbon Market
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      {footer ? <div className="border-t px-4 py-4">{footer}</div> : null}
    </aside>
  );
}

