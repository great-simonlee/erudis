import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProfilePage() {
  const { uid } = useParams();
  const { user, profile } = useAuth();
  const isSelf = uid === user?.uid;

  return (
    <div>
      <h1 className="font-display text-2xl text-fg">Profile</h1>
      <p className="mt-2 text-sm text-fg-muted">
        {isSelf
          ? `You (${profile?.name ?? 'member'})`
          : `Viewing profile ${uid ?? ''}`}{' '}
        — full profile in Phase 2.
      </p>
    </div>
  );
}
