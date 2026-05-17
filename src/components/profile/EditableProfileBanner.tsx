import { useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useToast } from '../../contexts/ToastContext';
import {
  saveProfileAvatarUrl,
  saveProfileCoverUrl,
  uploadProfileAvatar,
  uploadProfileCover,
  validateProfileImage,
} from '../../lib/profileMedia';
import { Button } from '../ui/Button';
import { roleLabel } from '../../utils/roleLabels';
import type { User } from '../../types';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp';

type EditableProfileBannerProps = {
  profileUser: User;
  isSelf: boolean;
  following: boolean;
  followBusy: boolean;
  followDisabled: boolean;
  onToggleFollow: () => void;
  onCoffeeChat: () => void;
  onMediaUpdated: (patch: Partial<Pick<User, 'avatarUrl' | 'coverUrl'>>) => void;
  stats: {
    papers: number;
    resonates: number;
    followers: number;
    following: number;
  };
  children?: ReactNode;
};

export function EditableProfileBanner({
  profileUser,
  isSelf,
  following,
  followBusy,
  followDisabled,
  onToggleFollow,
  onCoffeeChat,
  onMediaUpdated,
  stats,
  children,
}: EditableProfileBannerProps) {
  const { showToast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'avatar' | 'cover' | null>(null);

  const handleFile = async (kind: 'avatar' | 'cover', file: File | undefined) => {
    if (!file || !isSelf) return;
    const validation = validateProfileImage(file, kind);
    if (validation) {
      showToast(validation, 'error');
      return;
    }
    setBusy(kind);
    try {
      if (kind === 'avatar') {
        const url = await uploadProfileAvatar(profileUser.uid, file);
        await saveProfileAvatarUrl(profileUser.uid, url);
        onMediaUpdated({ avatarUrl: url });
        showToast('Profile photo updated.', 'success');
      } else {
        const url = await uploadProfileCover(profileUser.uid, file);
        await saveProfileCoverUrl(profileUser.uid, url);
        onMediaUpdated({ coverUrl: url });
        showToast('Cover image updated.', 'success');
      }
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'Could not upload image.',
        'error'
      );
    } finally {
      setBusy(null);
    }
  };

  const removeCover = async () => {
    if (!isSelf) return;
    setBusy('cover');
    try {
      await saveProfileCoverUrl(profileUser.uid, '');
      onMediaUpdated({ coverUrl: '' });
      showToast('Cover image removed.', 'success');
    } catch {
      showToast('Could not remove cover.', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-card border border-border bg-surface-card">
      <div className="group relative h-28 sm:h-32">
        {profileUser.coverUrl ? (
          <img
            src={profileUser.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="h-full w-full bg-gradient-to-br from-brand/25 via-surface-raised to-surface-card"
            aria-hidden
          />
        )}
        {isSelf ? (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-100 transition sm:bg-black/0 sm:opacity-0 sm:group-hover:bg-black/40 sm:group-hover:opacity-100 sm:group-focus-within:bg-black/40 sm:group-focus-within:opacity-100">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => coverInputRef.current?.click()}
              className="rounded-full border border-white/30 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50"
            >
              {busy === 'cover' ? 'Uploading…' : 'Change cover'}
            </button>
            {profileUser.coverUrl ? (
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
            const f = e.target.files?.[0];
            void handleFile('cover', f);
            e.target.value = '';
          }}
        />
      </div>

      <div className="relative px-4 pb-6 pt-0 sm:px-6">
        <div className="-mt-12 flex items-start gap-4">
          <div className="relative shrink-0">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt=""
                className="h-20 w-20 rounded-full border-[3px] border-brand object-cover sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-[3px] border-brand bg-surface-raised text-2xl font-medium text-fg-muted sm:h-24 sm:w-24">
                {profileUser.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            {isSelf ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-card bg-brand text-xs font-semibold text-white shadow-md hover:bg-brand-muted disabled:opacity-50 sm:h-9 sm:w-9"
                aria-label="Change profile photo"
                title="Change profile photo"
              >
                {busy === 'avatar' ? '…' : '✎'}
              </button>
            ) : null}
            <input
              ref={avatarInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                void handleFile('avatar', f);
                e.target.value = '';
              }}
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-2xl text-fg sm:text-3xl">{profileUser.name}</h1>
              <p className="mt-1 text-sm text-fg-muted">
                {roleLabel(profileUser.role)}
                {profileUser.institutionName ? (
                  <>
                    {' '}
                    · {profileUser.institutionName}
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              {profileUser.openToCollaborate ? (
                <span className="inline-flex h-10 items-center rounded-full bg-brand/20 px-3 text-xs font-medium text-brand">
                  Open to collaborate
                </span>
              ) : null}
              {isSelf ? (
                <Link
                  to={ROUTES.settings}
                  className="inline-flex h-10 items-center justify-center rounded-card border border-border bg-transparent px-4 text-sm font-medium text-fg hover:bg-surface-raised"
                >
                  Edit profile
                </Link>
              ) : (
                <>
                  <Button
                    type="button"
                    variant={following ? 'outline' : 'primary'}
                    disabled={followBusy || followDisabled}
                    onClick={onToggleFollow}
                  >
                    {following ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={followDisabled}
                    onClick={onCoffeeChat}
                  >
                    Coffee chat
                  </Button>
                  <Button type="button" variant="outline" disabled title="Coming soon">
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {profileUser.bio ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted">{profileUser.bio}</p>
        ) : null}
        {profileUser.researchAreas?.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {profileUser.researchAreas.map((a) => (
              <span
                key={a}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle"
              >
                {a}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4 border-t border-border pt-4 text-sm">
          <span>
            <strong className="text-fg">{stats.papers}</strong>{' '}
            <span className="text-fg-muted">papers</span>
          </span>
          <span>
            <strong className="text-fg">{stats.resonates}</strong>{' '}
            <span className="text-fg-muted">resonates on posts</span>
          </span>
          <span>
            <strong className="text-fg">{stats.followers}</strong>{' '}
            <span className="text-fg-muted">followers</span>
          </span>
          <span>
            <strong className="text-fg">{stats.following}</strong>{' '}
            <span className="text-fg-muted">following</span>
          </span>
        </div>

        {children}
      </div>
    </section>
  );
}
