import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db, firebaseReady } from '../../lib/firebase';
import { ROUTES } from '../../constants';
import { useAuth } from '../../hooks/useAuth';
import { EditableEntityBanner } from '../../components/entity/EditableEntityBanner';
import {
  saveInstitutionCoverUrl,
  saveInstitutionLogoUrl,
  uploadInstitutionCover,
  uploadInstitutionLogo,
} from '../../lib/entityMedia';
import { managesInstitution } from '../../lib/institutionAccess';
import {
  ensureInstitutionDoc,
  getInstitution,
  listLabsAtInstitution,
} from '../../lib/institutions';
import type { Institution, Lab } from '../../types';

export function InstitutionProfilePage() {
  const { institutionId } = useParams<{ institutionId: string }>();
  const { profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = useMemo(
    () => !!(institutionId && managesInstitution(profile, institutionId)),
    [profile, institutionId]
  );

  const load = useCallback(async () => {
    if (!institutionId || !firebaseReady || !db) {
      setInstitution(null);
      setLabs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const fs = db;
      let inst = await getInstitution(fs, institutionId);
      if (!inst) {
        inst = await ensureInstitutionDoc(fs, institutionId, institutionId.replace(/-/g, ' '));
      }
      setInstitution(inst);
      setLabs(await listLabsAtInstitution(fs, institutionId, inst.name));
    } finally {
      setLoading(false);
    }
  }, [institutionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-40 animate-pulse rounded-card border border-border bg-surface-raised/50" />
        <div className="h-32 animate-pulse rounded-card border border-border bg-surface-raised/50" />
      </div>
    );
  }

  if (!institution || !institutionId) {
    return <p className="text-sm text-fg-muted">Institution not found.</p>;
  }

  const mediaHandlers = {
    uploadLogo: (file: File) => uploadInstitutionLogo(institutionId, file),
    uploadCover: (file: File) => uploadInstitutionCover(institutionId, file),
    saveLogo: (url: string) => saveInstitutionLogoUrl(institutionId, url),
    saveCover: (url: string) => saveInstitutionCoverUrl(institutionId, url),
  };

  return (
    <div className="space-y-8">
      <EditableEntityBanner
        entityLabel="School / Institution"
        name={institution.name}
        subtitle={
          institution.websiteUrl ? (
            <a
              href={institution.websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand hover:underline"
            >
              {institution.websiteUrl.replace(/^https?:\/\//, '')}
            </a>
          ) : (
            `${labs.length} research lab${labs.length === 1 ? '' : 's'}`
          )
        }
        logoUrl={institution.logoUrl}
        coverUrl={institution.coverUrl}
        canEdit={canEdit}
        onMediaUpdated={(patch) => setInstitution((i) => (i ? { ...i, ...patch } : i))}
        mediaHandlers={mediaHandlers}
        actions={
          canEdit ? (
            <Link
              to={ROUTES.institutionManage(institutionId)}
              className="inline-flex items-center justify-center rounded-card border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-fg hover:bg-surface-raised"
            >
              Manage institution
            </Link>
          ) : undefined
        }
      >
        {institution.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">
            {institution.description}
          </p>
        ) : null}
      </EditableEntityBanner>

      <section>
        <h2 className="font-display text-lg text-fg">Research labs</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Labs affiliated with {institution.name}.
        </p>
        {labs.length === 0 ? (
          <p className="mt-4 text-sm text-fg-subtle">No labs listed yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {labs.map((lab) => (
              <li key={lab.id}>
                <Link
                  to={ROUTES.lab(lab.id)}
                  className="flex items-center gap-3 rounded-card border border-border bg-surface-card p-4 transition hover:border-brand/40"
                >
                  {lab.logoUrl ? (
                    <img
                      src={lab.logoUrl}
                      alt=""
                      className="h-12 w-12 rounded-full border border-brand object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brand bg-surface-raised text-sm font-medium text-fg-muted">
                      {lab.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-fg">{lab.name}</p>
                    <p className="text-xs text-fg-subtle">
                      {lab.researchAreas?.[0] ?? 'Research'} · {lab.memberIds.length} members
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
