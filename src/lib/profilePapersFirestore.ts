import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';

export type PaperWriteInput = {
  title: string;
  authors: string[];
  abstract: string;
  publicationYear: number | null;
  venue: string | null;
  doi: string | null;
  url: string | null;
  arxivId: string | null;
  labId: string | null;
};

export async function createProfilePaper(
  db: Firestore,
  uid: string,
  input: PaperWriteInput
): Promise<string> {
  const ref = await addDoc(collection(db, 'papers'), {
    ...input,
    addedBy: uid,
    resonateCount: 0,
    viewCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProfilePaper(
  db: Firestore,
  paperId: string,
  input: PaperWriteInput
): Promise<void> {
  await updateDoc(doc(db, 'papers', paperId), input);
}

export async function deleteProfilePaper(db: Firestore, paperId: string): Promise<void> {
  await deleteDoc(doc(db, 'papers', paperId));
}
