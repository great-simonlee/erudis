import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';

/** Requires Firebase user with verified email. */
export function EmailVerifiedGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-fg-muted">
        <p className="text-sm">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  if (!user.emailVerified) {
    return <Navigate to={ROUTES.verifyEmail} replace />;
  }

  return <Outlet />;
}
