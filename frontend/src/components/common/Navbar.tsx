import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Sidebar, SidebarItem } from "../ui/sidebar";
import { useIsMobile } from "../ui/use-mobile";

const mobileNavItems: SidebarItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/wallet", label: "Wallet" },
  { to: "/listings", label: "Listings" },
  { to: "/credits", label: "Credits" },
  { to: "/transactions", label: "Transactions" },
  { to: "/profile", label: "Profile" }
];

export function Navbar() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-8">
      {isMobile ? (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar items={mobileNavItems} footer={<MobileFooter logout={logout} />} />
          </SheetContent>
        </Sheet>
      ) : null}
      <div className="flex flex-1 items-center justify-end gap-6">
        <div className="hidden text-sm text-muted-foreground md:block">
          Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}

function MobileFooter({ logout }: { logout: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={logout} variant="outline">
        Logout
      </Button>
    </div>
  );
}

