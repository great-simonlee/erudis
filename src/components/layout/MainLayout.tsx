import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useDemoEcosystemBootstrap } from '../../hooks/useDemoEcosystemBootstrap';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Navbar } from './Navbar';
import { MobileTabBar } from './MobileTabBar';

export function MainLayout() {
  const { user } = useAuth();
  useDemoEcosystemBootstrap(user?.uid);

  return (
    <div className="erudis-app-shell flex min-h-screen flex-col text-fg md:h-[100dvh] md:max-h-[100dvh] md:overflow-hidden">
      <Navbar />
      <div className="flex flex-1 flex-col pt-14 md:min-h-0 md:flex-row md:overflow-hidden md:pt-0">
        <LeftSidebar />
        <main className="erudis-zone-main flex-1 min-h-min overflow-visible md:min-h-0 md:overflow-y-auto">
          <div className="min-h-full w-full px-3 py-4 pb-28 md:px-6 md:py-6 md:pb-8 lg:px-8">
            <Outlet />
          </div>
        </main>
        <RightSidebar />
      </div>
      <MobileTabBar />
    </div>
  );
}
