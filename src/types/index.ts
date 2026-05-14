import type { Timestamp } from 'firebase/firestore';

export type UserRole =
  | 'professor'
  | 'phd'
  | 'postdoc'
  | 'researcher'
  | 'research_scientist'
  | 'industry_researcher'
  | 'institution_admin'
  /** Set during onboarding; not chosen at sign-up. */
  | 'pending';

export type SubscriptionTier = 'free' | 'pro' | 'pro_write' | 'lab_pro';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  institutionId: string | null;
  institutionName: string | null;
  labOnboardingIntent: 'join_lab' | 'create_lab' | 'defer' | null;
  labIds: string[];
  primaryLabId: string | null;
  researchAreas: string[];
  following: string[];
  followers: string[];
  isVerified: boolean;
  openToCollaborate: boolean;
  collaborationTypes: string[];
  openToWork: string[];
  subscription: SubscriptionTier;
  bio: string;
  avatarUrl: string;
  websiteUrl: string;
  profileViews: number;
  createdAt: Timestamp | null;
}

export interface Lab {
  id: string;
  name: string;
  institutionId: string;
  piId: string;
  memberIds: string[];
  researchAreas: string[];
  description: string;
  logoUrl: string;
  requirePostApproval: boolean;
  isLabPro: boolean;
  followers: string[];
  createdAt: Timestamp | null;
}

export type PostType =
  | 'update'
  | 'result'
  | 'paper_review'
  | 'idea'
  | 'milestone'
  | 'paper'
  | 'question';

export type PostVisibility = 'public' | 'members_only' | 'private';

export interface Post {
  id: string;
  authorId: string;
  labId: string | null;
  institutionId: string | null;
  type: PostType;
  title: string;
  content: string;
  attachments: { url: string; type: string; name: string }[];
  tags: string[];
  researchArea: string;
  resonateCount: number;
  viewCount: number;
  commentCount: number;
  visibility: PostVisibility;
  isPendingApproval: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type ResearchLogType =
  | 'experiment'
  | 'paper_review'
  | 'idea'
  | 'result'
  | 'writing'
  | 'other';

export interface ResearchLog {
  id: string;
  userId: string;
  date: string;
  type: ResearchLogType;
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: Timestamp | null;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId: string | null;
  createdAt: Timestamp | null;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  doi: string | null;
  abstract: string;
  publicationYear: number | null;
  venue: string | null;
  url: string | null;
  addedBy: string;
  createdAt: Timestamp | null;
}
