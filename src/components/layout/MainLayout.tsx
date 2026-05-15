import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ResearchLogModal } from '../profile/ResearchLogModal';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { Navbar } from './Navbar';
import { MobileTabBar } from './MobileTabBar';

export function MainLayout() {
  const { user } = useAuth();
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-fg md:h-[100dvh] md:max-h-[100dvh] md:overflow-hidden">
      <Navbar />
      <div className="flex flex-1 flex-col pt-14 md:min-h-0 md:flex-row md:overflow-hidden md:pt-0">
        <LeftSidebar />
        <main className="flex-1 min-h-min overflow-visible border-x border-border md:min-h-0 md:overflow-y-auto md:border-x-0">
          <div className="mx-auto min-h-full max-w-3xl px-4 py-6 pb-24 md:px-8 md:py-8 md:pb-8">
            <Outlet />
          </div>
        </main>
        <RightSidebar />
      </div>
      <MobileTabBar />
      {user && (
        <>
          <ResearchLogModal
            open={logOpen}
            onClose={() => setLogOpen(false)}
            userId={user.uid}
            onSaved={() => setLogOpen(false)}
          />
          <button
            type="button"
            onClick={() => setLogOpen(true)}
            className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand text-lg font-medium text-white shadow-lg hover:bg-brand-muted md:bottom-8 md:right-8"
            aria-label="New research log"
          >
            +
          </button>
        </>
      )}
    </div>
  );
}
