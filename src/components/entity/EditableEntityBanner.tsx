import { useRef, useState, type ReactNode } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { validateProfileImage } from '../../lib/profileMedia';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

export type EntityMediaHandlers = {
  uploadLogo: (file: File) => Promise<string>;
  uploadCover: (file: File) => Promise<string>;
  saveLogo: (url: string) => Promise<void>;
  saveCover: (url: string) => Promise<void>;
};

type EditableEntityBannerProps = {
  entityLabel: string;
  name: string;
  subtitle?: ReactNode;
  logoUrl?: string;
  coverUrl?: string;
  canEdit: boolean;
  onMediaUpdated: (patch: { logoUrl?: string; coverUrl?: string }) => void;
  mediaHandlers: EntityMediaHandlers;
  actions?: ReactNode;
  children?: ReactNode;
};

export function EditableEntityBanner({
  entityLabel,
  name,
  subtitle,
  logoUrl,
  coverUrl,
  canEdit,
  onMediaUpdated,
  mediaHandlers,
  actions,
  children,
}: EditableEntityBannerProps) {
  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'logo' | 'cover' | null>(null);

  const handleFile = async (kind: 'logo' | 'cover', file: File | undefined) => {
    if (!file || !canEdit) return;
    const validation = validateProfileImage(file, kind === 'logo' ? 'avatar' : 'cover');
    if (validation) {
      showToast(validation, 'error');
      return;
    }
    setBusy(kind);
    try {
      if (kind === 'logo') {
        const url = await mediaHandlers.uploadLogo(file);
        await mediaHandlers.saveLogo(url);
        onMediaUpdated({ logoUrl: url });
        showToast('Profile photo updated.', 'success');
      } else {
        const url = await mediaHandlers.uploadCover(file);
        await mediaHandlers.saveCover(url);
        onMediaUpdated({ coverUrl: url });
        showToast('Cover image updated.', 'success');
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Could not upload image.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const removeCover = async () => {
    if (!canEdit) return;
    setBusy('cover');
    try {
      await mediaHandlers.saveCover('');
      onMediaUpdated({ coverUrl: '' });
      showToast('Cover image removed.', 'success');
    } catch {
      showToast('Could not remove cover.', 'error');
    } finally {
      setBusy(null);
    }
  };

  const initial = name.slice(0, 1).toUpperCase();

  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-surface-card">
      <div className="group relative h-28 sm:h-32">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-brand/25 via-surface-raised to-surface-card"
            aria-hidden
          />
        )}
        {canEdit ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-100 transition sm:bg-black/0 sm:opacity-0 sm:group-hover:bg-black/40 sm:group-hover:opacity-100">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => coverInputRef.current?.click()}
              className="rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
            >
              {busy === 'cover' ? 'Uploading…' : 'Change cover'}
            </button>
            {coverUrl ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void removeCover()}
                className="rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
              >
                Remove
              </button>
            ) : null}
          </div>
        ) : null}
        <input
          ref={coverInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(e) => {
            void handleFile('cover', e.target.files?.[0]);
            e.target.value = '';
          }}
        />
      </div>

      <div className="relative px-4 pb-6 pt-0 sm:px-6">
        <div className="-mt-12 flex items-start gap-4 sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-end gap-4">
            <div className="relative shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt=""
                  className="h-20 w-20 rounded-full border-[3px] border-brand object-cover sm:h-24 sm:w-24"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-brand bg-surface-raised text-2xl font-medium text-fg-muted sm:h-24 sm:w-24">
                  {initial}
                </div>
              )}
              {canEdit ? (
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-card bg-brand text-xs font-semibold text-white shadow-md hover:bg-brand-muted disabled:opacity-50 sm:h-9 sm:w-9"
                  aria-label="Change profile photo"
                >
                  {busy === 'logo' ? '…' : '✎'}
                </button>
              ) : null}
              <input
                ref={logoInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  void handleFile('logo', e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </div>
            <div className="min-w-0 pb-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand">
                {entityLabel}
              </p>
              <h1 className="font-display text-2xl text-fg sm:text-3xl">{name}</h1>
              {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </div>
    </section>
  );
}
