import {
  BarChart3,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  User,
  Wallet2
} from "lucide-react";
import { Sidebar, SidebarItem } from "../ui/sidebar";

const sidebarItems: SidebarItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    end: true
  },
  {
    to: "/wallet",
    label: "Wallet",
    icon: <Wallet2 className="h-4 w-4" />
  },
  {
    to: "/listings",
    label: "Listings",
    icon: <Briefcase className="h-4 w-4" />
  },
  {
    to: "/credits",
    label: "Credits",
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <User className="h-4 w-4" />
  }
];

export function SidebarNav() {
  return <Sidebar items={sidebarItems} />;
}

