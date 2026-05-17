import type {
  ProfileEducation,
  ProfileWorkExperience,
  ResearchLog,
  ResearchLogType,
} from '../types';
import careerByUid from './demoProfileCareerData.json';

type DemoResearchLogSeed = {
  date: string;
  type: ResearchLogType;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
};

type DemoProfileCareerEntry = {
  educations?: ProfileEducation[];
  workExperiences?: ProfileWorkExperience[];
  researchLogs?: DemoResearchLogSeed[];
};

const ENTRIES = careerByUid as Record<string, DemoProfileCareerEntry>;

export function isDemoProfileCareerUid(uid: string): boolean {
  return uid in ENTRIES;
}

export function getDemoProfileEducations(uid: string): ProfileEducation[] {
  return ENTRIES[uid]?.educations ?? [];
}

export function getDemoProfileWorkExperiences(uid: string): ProfileWorkExperience[] {
  return ENTRIES[uid]?.workExperiences ?? [];
}

export function getDemoProfileResearchLogs(
  uid: string,
  includePrivate: boolean
): ResearchLog[] {
  const seeds = ENTRIES[uid]?.researchLogs ?? [];
  return seeds
    .filter((log) => includePrivate || log.isPublic)
    .map((log, index) => ({
      id: `demo-preview-log-${uid}-${index}`,
      userId: uid,
      ...log,
      createdAt: null,
    }));
}
