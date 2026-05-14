import { Outlet } from 'react-router-dom';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Navbar } from './Navbar';
import { MobileTabBar } from './MobileTabBar';

export function MainLayout() {
  return (
    <div className="min-h-screen bg-surface text-fg">
      <Navbar />
      <div className="flex min-h-screen pt-14 md:pt-0">
        <LeftSidebar />
        <main className="min-h-screen flex-1 border-x border-border md:border-x-0">
          <div className="mx-auto max-w-3xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
            <Outlet />
          </div>
        </main>
        <RightSidebar />
      </div>
      <MobileTabBar />
    </div>
  );
}
