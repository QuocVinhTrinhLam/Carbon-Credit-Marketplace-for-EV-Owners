import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import { SidebarNav } from "../components/common/SidebarNav";
import { useIsMobile } from "../components/ui/use-mobile";
import OnboardingTour from "../components/OnboardingTour";
import { shouldShowOnboarding } from "../utils/onboarding";

const MainLayout = () => {
  const isMobile = useIsMobile();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if onboarding should be shown on mount
    if (shouldShowOnboarding()) {
      // Small delay to ensure the dashboard page is fully loaded
      const timeout = setTimeout(() => {
        setShowTour(true);
      }, 1500);

      return () => clearTimeout(timeout);
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {!isMobile ? <SidebarNav /> : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-100 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>

      {/* Onboarding tour - only shows for first-time users */}
      {showTour && (
        <OnboardingTour
          onComplete={() => {
            setShowTour(false);
          }}
        />
      )}
    </div>
  );
};

export default MainLayout;

