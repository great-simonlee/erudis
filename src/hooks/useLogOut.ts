import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, firebaseReady } from '../lib/firebase';
import { useToast } from '../contexts/ToastContext';

function scrollAppToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const main = document.querySelector('main.erudis-zone-main');
  if (main instanceof HTMLElement) main.scrollTop = 0;
}

export function useLogOut() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [signingOut, setSigningOut] = useState(false);

  const logOut = async () => {
    if (!auth || !firebaseReady) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      navigate('/', { replace: true });
      scrollAppToTop();
      requestAnimationFrame(scrollAppToTop);
    } catch {
      showToast('Could not sign out. Try again.', 'error');
    } finally {
      setSigningOut(false);
    }
  };

  return { logOut, signingOut };
}
