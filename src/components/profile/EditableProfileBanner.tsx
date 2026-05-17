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
    likesReceived: number;
    resonatesReceived: number;
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
    <section className="relative overflow-hidden rounded-card border border-border bg-surface-card shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_28px_-14px_rgba(0,0,0,0.5)]">
      <div className="group relative h-32 sm:h-36">
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
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface-card via-surface-card/90 to-transparent sm:h-16"
          aria-hidden
        />
        {isSelf ? (
          <div className="absolute inset-x-0 top-0 flex justify-end gap-1.5 p-2 sm:inset-0 sm:items-center sm:justify-center sm:gap-2 sm:bg-black/0 sm:opacity-0 sm:transition sm:group-hover:bg-black/40 sm:group-hover:opacity-100 sm:group-focus-within:bg-black/40 sm:group-focus-within:opacity-100">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => coverInputRef.current?.click()}
              className="rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-xs"
            >
              {busy === 'cover' ? 'Uploading…' : 'Change cover'}
            </button>
            {profileUser.coverUrl ? (
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void removeCover()}
                className="rounded-full border border-white/30 bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm hover:bg-black/70 disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-xs"
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

      <div className="relative bg-surface-card px-5 pb-6 pt-1 sm:px-6">
        <div className="-mt-14 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-start sm:gap-5">
          <div className="relative shrink-0 self-start">
            {profileUser.avatarUrl ? (
              <img
                src={profileUser.avatarUrl}
                alt=""
                className="h-[4.5rem] w-[4.5rem] rounded-full border-[3px] border-surface-card object-cover shadow-[0_4px_16px_-4px_rgba(29,158,117,0.35)] ring-2 ring-brand/30 sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[3px] border-surface-card bg-surface-raised text-2xl font-medium text-fg-muted shadow-md ring-2 ring-brand/30 sm:h-24 sm:w-24">
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
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-1">
            <div className="min-w-0">
              <h1 className="font-display text-[1.65rem] leading-tight text-fg sm:text-3xl">
                {profileUser.name}
              </h1>
              <p className="mt-1.5 text-sm leading-snug text-fg-muted">
                <span className="font-medium text-fg-soft">{roleLabel(profileUser.role)}</span>
                {profileUser.institutionName ? (
                  <>
                    <span className="text-fg-subtle"> · </span>
                    <span>{profileUser.institutionName}</span>
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
              {profileUser.openToCollaborate ? (
                <span className="inline-flex h-10 items-center rounded-full bg-brand/20 px-3 text-xs font-medium text-brand">
                  Open to collaborate
                </span>
              ) : null}
              {isSelf ? (
                <Link
                  to={ROUTES.settings}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border bg-surface-raised px-4 text-sm font-medium text-fg transition-colors hover:border-brand/35 hover:bg-brand/5 sm:h-10 sm:w-auto sm:rounded-card sm:bg-transparent"
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

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border pt-5 text-sm sm:flex sm:flex-wrap sm:gap-4">
          <span>
            <strong className="text-fg">{stats.papers}</strong>{' '}
            <span className="text-fg-muted">papers</span>
          </span>
          <span>
            <strong className="text-fg">{stats.likesReceived}</strong>{' '}
            <span className="text-fg-muted">likes received</span>
          </span>
          <span>
            <strong className="text-fg">{stats.resonatesReceived}</strong>{' '}
            <span className="text-fg-muted">resonates received</span>
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
