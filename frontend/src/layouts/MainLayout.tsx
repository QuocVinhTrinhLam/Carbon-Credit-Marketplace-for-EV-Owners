import { Outlet } from "react-router-dom";
import { Navbar } from "../components/common/Navbar";
import { SidebarNav } from "../components/common/SidebarNav";
import { useIsMobile } from "../components/ui/use-mobile";

const MainLayout = () => {
  const isMobile = useIsMobile();
  return (
    <div className="flex min-h-screen bg-slate-100">
      {!isMobile ? <SidebarNav /> : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-100 px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

