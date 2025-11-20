import {
  BarChart3,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  User,
  Wallet2,
  UploadCloud
} from "lucide-react";
import { Sidebar, SidebarItem } from "../ui/sidebar";

/**
 * Sidebar items used for desktop sidebar
 * - added UploadCloud item for uploading driving data
 */
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
    to: "/marketplace",
    label: "Marketplace",
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
  },

  {
    to: "/upload",
    label: "Upload",
    icon: <UploadCloud className="h-4 w-4" />
  },

  // Upload driving data removed
]
export function SidebarNav() {
  return <Sidebar items={sidebarItems} />;
}
