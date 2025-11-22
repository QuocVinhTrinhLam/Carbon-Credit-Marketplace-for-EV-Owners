import { Menu, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Sidebar, SidebarItem } from "../ui/sidebar";
import { useIsMobile } from "../ui/use-mobile";
import { triggerOnboardingTour } from "../../utils/triggerTour";

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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleStartTour = () => {
    // Navigate to dashboard first, then start tour
    navigate("/dashboard");
    // Small delay to ensure page loads before starting tour
    setTimeout(() => {
      triggerOnboardingTour(navigate);
    }, 500);
  };

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
            <Sidebar items={mobileNavItems} footer={<MobileFooter logout={logout} onStartTour={handleStartTour} />} />
          </SheetContent>
        </Sheet>
      ) : null}
      <div className="flex flex-1 items-center justify-end gap-6">
        <div className="hidden text-sm text-muted-foreground md:block">
          Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Tutorial button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartTour}
            className="gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Tutorial</span>
          </Button>

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

function MobileFooter({ logout, onStartTour }: { logout: () => void; onStartTour: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onStartTour} variant="outline" className="gap-2">
        <GraduationCap className="h-4 w-4" />
        Tutorial
      </Button>
      <Button onClick={logout} variant="outline">
        Logout
      </Button>
    </div>
  );
}

