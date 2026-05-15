import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

export function BriefPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl text-fg">Weekly brief</h1>
      <p className="text-sm text-fg-muted leading-relaxed">
        A digest of trending fields, standout posts, and lab activity will appear here. For now,
        use <Link className="text-brand hover:underline" to={ROUTES.discover}>Discover</Link> to
        browse public research in real time.
      </p>
      <p className="text-xs text-fg-subtle">
        Automated weekly ranking can be added with a scheduled Cloud Function later.
      </p>
    </div>
  );
}
