import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase';
import { validateProfileImage } from './profileMedia';

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

export async function uploadLabLogo(labId: string, file: File): Promise<string> {
  const err = validateProfileImage(file, 'avatar');
  if (err) throw new Error(err);
  return uploadToPath(`lab-logos/${labId}/logo.${fileExtension(file)}`, file);
}

export async function uploadLabCover(labId: string, file: File): Promise<string> {
  const err = validateProfileImage(file, 'cover');
  if (err) throw new Error(err);
  return uploadToPath(`lab-covers/${labId}/cover.${fileExtension(file)}`, file);
}

export async function saveLabLogoUrl(labId: string, logoUrl: string): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'labs', labId), { logoUrl });
}

export async function saveLabCoverUrl(labId: string, coverUrl: string): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'labs', labId), { coverUrl });
}

export async function uploadInstitutionLogo(
  institutionId: string,
  file: File
): Promise<string> {
  const err = validateProfileImage(file, 'avatar');
  if (err) throw new Error(err);
  return uploadToPath(
    `institution-logos/${institutionId}/logo.${fileExtension(file)}`,
    file
  );
}

export async function uploadInstitutionCover(
  institutionId: string,
  file: File
): Promise<string> {
  const err = validateProfileImage(file, 'cover');
  if (err) throw new Error(err);
  return uploadToPath(
    `institution-covers/${institutionId}/cover.${fileExtension(file)}`,
    file
  );
}

export async function saveInstitutionLogoUrl(
  institutionId: string,
  logoUrl: string
): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'institutions', institutionId), { logoUrl });
}

export async function saveInstitutionCoverUrl(
  institutionId: string,
  coverUrl: string
): Promise<void> {
  if (!db) throw new Error('Firestore is not available.');
  await updateDoc(doc(db, 'institutions', institutionId), { coverUrl });
}
