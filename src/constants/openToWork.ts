/** “Open to work”–style availability tags (LinkedIn-style). Stored on user profile. */
export const OPEN_TO_WORK_OPTIONS = [
  { id: 'collaboration', label: 'Open to collaboration' },
  { id: 'postdoc_positions', label: 'Looking for postdoc positions' },
  { id: 'faculty_positions', label: 'Looking for faculty positions' },
  { id: 'industry', label: 'Open to industry opportunities' },
  { id: 'consulting', label: 'Available for consulting' },
  { id: 'nothing_now', label: 'Nothing right now' },
] as const;

export type OpenToWorkId = (typeof OPEN_TO_WORK_OPTIONS)[number]['id'];
