import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import type { ProfileEducation, ProfileWorkExperience } from '../types';

export async function saveUserEducations(
  db: Firestore,
  uid: string,
  educations: ProfileEducation[]
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { educations });
}

export async function saveUserWorkExperiences(
  db: Firestore,
  uid: string,
  workExperiences: ProfileWorkExperience[]
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { workExperiences });
}

export function upsertCareerEntry<T extends { id: string }>(list: T[], entry: T): T[] {
  const index = list.findIndex((item) => item.id === entry.id);
  if (index < 0) return [...list, entry];
  const next = [...list];
  next[index] = entry;
  return next;
}

export function removeCareerEntry<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id);
}
