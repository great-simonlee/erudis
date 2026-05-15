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
  /** Display name for the institution (catalog or custom). */
  institutionName?: string | null;
  department?: string;
  websiteUrl?: string;
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

export type LabInviteStatus = 'pending' | 'accepted' | 'declined';

export interface LabInvite {
  id: string;
  labId: string;
  invitedBy: string;
  invitedEmail: string;
  invitedUid: string | null;
  role: UserRole;
  status: LabInviteStatus;
  createdAt: Timestamp | null;
}

export type NotificationType =
  | 'resonate'
  | 'comment'
  | 'follow'
  | 'lab_invite'
  | 'mention'
  | 'profile_visit';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  fromUserId: string;
  /** Recipient of the notification (matches path); used by security rules. */
  targetUserId?: string | null;
  postId: string | null;
  postTitle: string | null;
  labId: string | null;
  labName: string | null;
  message: string;
  isRead: boolean;
  createdAt: Timestamp | null;
}

export interface JobPost {
  id: string;
  /** Lab-attached listing (PI) or null for standalone / institution postings. */
  labId: string | null;
  postedByUserId?: string | null;
  title: string;
  description: string;
  active: boolean;
  /** Tenure-track | Postdoc | PhD Position | Research Scientist | Industry */
  positionType?: string;
  location?: string | null;
  remote?: boolean;
  institutionName?: string | null;
  department?: string | null;
  applicationUrl?: string | null;
  /** ISO date string YYYY-MM-DD */
  deadline?: string | null;
  sponsored?: boolean;
  createdAt: Timestamp | null;
}

export type CoffeeChatStatus = 'pending' | 'accepted' | 'declined';

export interface CoffeeChat {
  id: string;
  fromUserId: string;
  toUserId: string;
  message: string;
  status: CoffeeChatStatus;
  createdAt: Timestamp | null;
}

export interface ProfileVisitorRow {
  visitorUid: string;
  visitorName: string;
  visitorAvatarUrl: string;
  visitorInstitution: string;
  visitorRole: UserRole;
  visitCount: number;
  lastVisitAt: Timestamp | null;
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
  /** arXiv id without "arxiv.org/abs/" prefix, when applicable */
  arxivId?: string | null;
  addedBy: string;
  resonateCount?: number;
  viewCount?: number;
  labId?: string | null;
  createdAt: Timestamp | null;
}

/** One row in a user’s personalized home feed (fan-out). */
export interface FeedItem {
  postId: string;
  authorId: string;
  createdAt: Timestamp | null;
  /** When set, feed writes are allowed for lab followers or lab members (see Firestore rules). */
  sourceLabId?: string | null;
}

/** Aggregated research activity for the contribution graph. */
export interface ResearchGraph {
  loggedDates: string[];
  currentStreak: number;
  longestStreak: number;
  totalLogDays: number;
  last30DayCount: number;
  updatedAt: Timestamp | null;
}
