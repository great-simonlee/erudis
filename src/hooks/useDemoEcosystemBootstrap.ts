import { useEffect, useRef } from 'react';
import { db, firebaseReady } from '../lib/firebase';
import { DEMO_BOOTSTRAP_STORAGE_KEY } from '../dev/demoEcosystemCatalog';
import { linkCurrentUserToDemoEcosystem } from '../dev/linkDemoEcosystem';
import { isDemoEcosystemAvailable } from '../lib/demoEcosystem';

export const DEMO_FEED_REFRESH_EVENT = 'erudis-demo-feed-refresh';

/**
 * Once per signed-in user, links their account to the Firestore demo ecosystem
 * (follow personas + fan demo posts into home feed) when `npm run seed:firestore` has been run.
 */
export function useDemoEcosystemBootstrap(uid: string | undefined) {
  const ran = useRef(false);

  useEffect(() => {
    if (!uid || !firebaseReady || !db || ran.current) return;
    ran.current = true;

    const storageKey = `${DEMO_BOOTSTRAP_STORAGE_KEY}:${uid}`;

    void (async () => {
      const fs = db;
      if (!fs) return;
      if (localStorage.getItem(storageKey) === '1') return;
      if (!(await isDemoEcosystemAvailable(fs))) return;

      try {
        const { followed, feedItems } = await linkCurrentUserToDemoEcosystem(fs, uid);
        if (followed > 0 || feedItems > 0) {
          localStorage.setItem(storageKey, '1');
          window.dispatchEvent(new CustomEvent(DEMO_FEED_REFRESH_EVENT));
        }
      } catch {
        /* rules or offline — ignore */
      }
    })();
  }, [uid]);
}
