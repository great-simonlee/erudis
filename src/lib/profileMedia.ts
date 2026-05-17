import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const COVER_MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function validateProfileImage(
  file: File,
  kind: 'avatar' | 'cover'
): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return 'Use a JPG, PNG, or WebP image.';
  }
  const max = kind === 'avatar' ? AVATAR_MAX_BYTES : COVER_MAX_BYTES;
  if (file.size > max) {
    return kind === 'avatar'
      ? 'Photo must be 5 MB or smaller.'
      : 'Cover image must be 8 MB or smaller.';
  }
  return null;
}

function fileExtension(file: File): string {
  if (file.type.includes('png')) return 'png';
  if (file.type.includes('webp')) return 'webp';
  return 'jpeg';
}

async function uploadToPath(path: string, file: File): Promise<string> {
  if (!storage) throw new Error('Storage is not available.');
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function uploadProfileAvatar(uid: string, file: File): Promise<string> {
  const err = validateProfileImage(file, 'avatar');
  if (err) throw new Error(err);
  const ext = fileExtension(file);
  return uploadToPath(`avatars/${uid}/profile.${ext}`, file);
}

export async function uploadProfileCover(uid: string, file: File): Promise<string> {
  const err = validateProfileImage(file, 'cover');
  if (err) throw new Error(err);
  const ext = fileExtension(file);
  return uploadToPath(`covers/${uid}/cover.${ext}`, file);
}

export async function saveProfileAvatarUrl(uid: string, avatarUrl: string): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'users', uid), { avatarUrl });
}

export async function saveProfileCoverUrl(uid: string, coverUrl: string): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'users', uid), { coverUrl });
}
