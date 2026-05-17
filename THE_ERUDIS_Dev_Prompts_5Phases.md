# THE ERUDIS — Web Development Prompts (5 Phases)
# Cursor AI용 단계별 개발 프롬프트

> **Stack:** React (TypeScript) · Firebase (Firestore, Auth, Storage, Functions) · Vercel
> **Repository:** https://github.com/great-simonlee/erudis
> **Domain:** theerudis.com
> **Brand Color:** #1D9E75

> **구현 현황:** 아래 5-Phase 프롬프트는 **스펙(요구사항)** 이고, 실제로 지금까지 개발된 내용은 문서 하단 **[개발 구현 현황 (Implementation Log)](#개발-구현-현황-implementation-log)** 에 Phase·파일·Firestore·Storage·시드·델타·미구현까지 상세 기록되어 있다. (갱신: 2026-05-15)

---

---

# PHASE 1 — Foundation & Authentication
## 프로젝트 기반 세팅 + 회원가입/로그인

---

## Prompt 1-1: 프로젝트 초기 세팅

```
You are building THE ERUDIS — a verified academic social network for Professors, PhD candidates, Postdocs, and Researchers. 

Tech stack:
- React 18 with TypeScript
- Firebase (Firestore, Auth, Storage, Functions)
- Tailwind CSS
- React Router v6
- Vercel deployment

Brand:
- Primary color: #1D9E75
- Font: Inter for UI, Playfair Display for headings (load from Google Fonts)
- Dark background: #0a0a0a
- Card background: #141414
- Border color: #222222

Please set up the following project structure:

src/
├── components/
│   ├── ui/              # reusable UI components
│   ├── layout/          # Navbar, Sidebar, Layout wrapper
│   └── shared/          # shared components across pages
├── pages/
│   ├── auth/            # Login, Register, Verify
│   ├── feed/            # Home feed
│   ├── profile/         # User profile
│   ├── lab/             # Lab pages
│   ├── discover/        # Discovery feed
│   └── settings/        # User settings
├── hooks/               # custom React hooks
├── lib/
│   └── firebase.ts      # Firebase initialization
├── types/               # TypeScript type definitions
├── utils/               # helper functions
└── constants/           # app constants

Create the following files:
1. src/lib/firebase.ts — Firebase initialization with all services (Auth, Firestore, Storage)
2. src/types/index.ts — All TypeScript interfaces (User, Lab, Post, Paper, ResearchLog)
3. src/constants/index.ts — App constants (colors, routes, field categories)
4. tailwind.config.js — Custom theme with brand colors

TypeScript interfaces to create:

interface User {
  uid: string;
  name: string;
  email: string;
  role: 'professor' | 'phd' | 'postdoc' | 'researcher' | 'institution_admin';
  institutionId: string | null;
  labIds: string[];
  primaryLabId: string | null;
  researchAreas: string[];
  following: string[];
  followers: string[];
  isVerified: boolean;
  openToCollaborate: boolean;
  collaborationTypes: string[];
  subscription: 'free' | 'pro' | 'pro_write' | 'lab_pro';
  bio: string;
  avatarUrl: string;
  profileViews: number;
  createdAt: any;
}

interface Lab {
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
  createdAt: any;
}

interface Post {
  id: string;
  authorId: string;
  labId: string | null;
  institutionId: string | null;
  type: 'update' | 'result' | 'paper_review' | 'idea' | 'milestone' | 'paper' | 'question';
  title: string;
  content: string;
  attachments: { url: string; type: string; name: string }[];
  tags: string[];
  researchArea: string;
  resonateCount: number;
  viewCount: number;
  commentCount: number;
  visibility: 'public' | 'members_only' | 'private';
  isPendingApproval: boolean;
  createdAt: any;
  updatedAt: any;
}

interface ResearchLog {
  id: string;
  userId: string;
  date: string;
  type: 'experiment' | 'paper_review' | 'idea' | 'result' | 'writing' | 'other';
  title: string;
  content: string;
  isPublic: boolean;
  tags: string[];
  createdAt: any;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  parentCommentId: string | null;
  createdAt: any;
}

Use .env.local for all Firebase config values. Never hardcode API keys.
```

---

## Prompt 1-2: 인증 시스템 구현

```
Build the complete authentication system for THE ERUDIS.

IMPORTANT RULE: Every user must verify their institutional email to use the platform. 
Accepted email domains include .edu, .ac.kr, .ac.uk, .ac.jp, .edu.au, and other 
recognized academic institution domains.

Pages to build:

1. /register — Registration page
   - Fields: Full Name, Email (institutional only), Password, Role selector
   - Role options: Professor/PI | PhD Candidate | Postdoc | Researcher
   - Real-time email domain validation:
     * Show green checkmark if email is from recognized academic domain
     * Show red warning "Please use your institutional email (.edu, .ac.kr, etc.)" if not
     * Allow form submission only with valid institutional email
   - Password requirements: min 8 chars, at least 1 number
   - On submit: create Firebase Auth user + create Firestore /users/{uid} document
   - After registration: redirect to /verify-email page

2. /verify-email — Email verification waiting page
   - Show "We sent a verification email to [email]"
   - "Resend email" button (with 60-second cooldown)
   - Poll Firebase Auth every 3 seconds, redirect to /onboarding when verified
   - "Use a different email" link

3. /login — Login page
   - Email + Password fields
   - "Forgot password?" link → /reset-password
   - On success: check if profile is complete → redirect to /feed or /onboarding
   - Show specific error messages (wrong password, no account, etc.)

4. /reset-password — Password reset page
   - Email input → Firebase sendPasswordResetEmail
   - Success state UI

5. /onboarding — First-time setup (after email verification)
   - Step 1: Research areas selection (multi-select pills: Neuroscience, AI/ML, 
     Quantum Physics, Molecular Biology, Linguistics, Economics, Computer Science, 
     Chemistry, Physics, Mathematics, Psychology, Sociology, Other)
   - Step 2: Short bio (optional, max 280 chars)
   - Step 3: "Are you part of a research lab?" → Yes (search lab) / No (skip)
   - Progress bar showing steps 1/3, 2/3, 3/3
   - On complete: update Firestore user document, redirect to /feed

Design requirements:
- Dark theme: background #0a0a0a
- Card/form background: #141414
- Border: #222222
- Brand green #1D9E75 for CTAs and active states
- Clean, minimal — no decorative elements
- Mobile responsive

Create a custom hook: useAuth() that returns { user, loading, error }
Create an AuthGuard component that redirects to /login if not authenticated
```

---

## Prompt 1-3: 메인 레이아웃 & 네비게이션

```
Build the main layout and navigation for THE ERUDIS web app.

Layout structure (for authenticated users):
- Left sidebar (fixed, 240px wide on desktop)
- Main content area (flexible)
- Right sidebar (fixed, 300px wide on desktop, hidden on tablet/mobile)

Left Sidebar navigation items:
- THE ERUDIS logo (top)
- Home (feed icon)
- Discover (compass icon) 
- My Labs (flask icon)
- Papers (document icon)
- Jobs (briefcase icon)
- Messages (chat icon) [show unread count badge]
- Settings (gear icon, bottom)
- User avatar + name + role badge (bottom)

Active state: left border #1D9E75, text white, background #1a1a1a

Right Sidebar (contextual):
- "Trending this week" section showing top 3 resonated posts
- "Who to follow" section showing suggested researchers
- "Open positions" showing 2-3 recent job posts

Top bar (mobile only):
- THE ERUDIS logo center
- Notification bell right
- Avatar right

Mobile bottom tab bar:
- Home | Discover | Post(+) | Labs | Profile

Create a Navbar component, LeftSidebar component, RightSidebar component, 
and a MainLayout wrapper that composes them.

The layout should feel like a cross between Twitter and LinkedIn but 
more editorial and academic. No rounded corners on cards (use 8px max).
Clean grid lines. Restrained use of color — only use #1D9E75 for 
interactive/active elements.

All components must be fully TypeScript typed.
```

---
---

# PHASE 2 — Core Feed & Profile
## 피드 시스템 + 유저 프로필

---

## Prompt 2-1: 홈 피드 구현

```
Build the Home Feed page for THE ERUDIS at route /feed.

Feed item (PostCard component) should display:
- Author avatar (circle, 40px)
- Author name (clickable → /profile/{uid})
- Author role badge (Professor | PhD | Postdoc | Researcher) in small pill
- Lab affiliation (clickable → /lab/{labId}) if applicable
- Time since posted (e.g., "2h ago", "3 days ago")
- Post type badge — styled differently per type:
  * update → gray
  * result → purple (#EEEDFE text #3C3489)
  * paper_review → green
  * idea → yellow/orange
  * milestone → gold
  * paper → blue
  * question → teal
- Post title (bold, 16px)
- Post content (markdown rendered, truncated to 3 lines with "Read more")
- Tags (small pills, gray border)
- Action bar:
  * RESONATE button — wave icon + "Resonate" + count
    - NEVER call this "Like" anywhere in the code
    - Active state: #1D9E75 background, white text
    - Toggle on/off
    - Optimistic update (update count immediately, sync with Firestore)
  * Comment button — speech bubble icon + count → opens comment thread
  * Share button — link icon
  * Bookmark button (saves post)

Feed data fetching:
- Read from Firestore /feed/{userId}/items/ subcollection
- Order by createdAt descending
- Implement infinite scroll (load 15 posts, load more on scroll)
- Show skeleton loading state while fetching
- Show "You're all caught up!" when no more posts

Post creation button:
- Floating "What's on your research mind?" input bar at top of feed
- Clicking opens PostComposer modal

PostComposer modal:
- Title input
- Content textarea (markdown supported, show character count)
- Post type selector (dropdown with icons)
- Tags input (press Enter to add, max 5 tags)
- Research area selector
- Visibility toggle: Public | Lab Members Only | Private
- Attach files button (for PDFs/images)
- Submit button

When a post is submitted:
1. Create document in Firestore /posts/{postId}
2. Call Firebase Function to fan-out to followers' feeds
3. If labId is set, also fan out to lab followers

All Firestore operations must use proper error handling with try/catch.
Show toast notifications for success/error states.
```

---

## Prompt 2-2: 유저 프로필 페이지

```
Build the User Profile page at route /profile/:uid for THE ERUDIS.

Profile page sections (in order):

1. PROFILE HEADER
   - Cover area (subtle gradient, no image required initially)
   - Avatar (80px circle, border #1D9E75 2px)
   - Name (large, Playfair Display font)
   - Role badge + Institution name
   - Lab affiliation(s) — each clickable
   - Research areas (pills)
   - Bio text
   - Stats row: [X Papers] [X Resonates Received] [X Followers] [X Following]
   - Action buttons (when viewing others' profile):
     * Follow/Unfollow button
     * Coffee Chat request button (with coffee cup icon)
     * Message button
   - "Open to Collaborate" badge if enabled (green badge, top right)

2. RESEARCH GRAPH SECTION
   - Title: "Research Activity"
   - GitHub-style contribution graph:
     * 52 weeks × 7 days grid
     * Cell size: 13×13px, gap: 3px, border-radius: 2px
     * Logged day: filled #1D9E75
     * No log: #1e1e1e (empty)
     * BINARY ONLY — no intensity levels (either logged or not)
     * Hover tooltip: "May 10, 2026 · Logged" or "May 10, 2026 · No entry"
     * Month labels above grid
     * Day labels (Mon, Wed, Fri) on left
   - Stats below graph: 
     * Total log days | Current streak 🔥 | Longest streak | Last 30 days %
   - "View all logs" link

3. RECENT RESEARCH LOGS
   - Show last 5 public research logs
   - Each log: date, type badge, title, excerpt
   - Type colors: experiment=blue, paper_review=green, idea=orange, result=purple, writing=gray

4. PAPERS
   - List of papers authored/co-authored
   - Each: title, journal/arxiv, year, co-authors, Resonate count, View count
   - "View on arXiv" link if arxivId exists

5. RECENT POSTS
   - Last 6 posts in 2-column grid (PostCard compact version)

6. LAB MEMBERSHIPS
   - Cards showing each lab: lab name, institution, PI name, role in lab

If viewing own profile:
- Show "Edit Profile" button
- Research logs show both public and private entries
- Profile visitor count: "X people viewed your profile this week"
  * Free users: blurred after showing count only
  * Pro users: see full visitor list

Visitor tracking:
- When any user views a profile, write to /profile_visits/{visitedUid}/visitors/{visitorUid}
- Increment viewCount on the user document

Make the profile page fully responsive.
Research Graph must be horizontally scrollable on mobile.
```

---

## Prompt 2-3: Research Log 작성 시스템

```
Build the Research Log system for THE ERUDIS.

This is the core feature that powers the Research Graph (GitHub contribution graph).

1. RESEARCH LOG MODAL (accessible from profile page and floating button)
   
   Fields:
   - Date (date picker, defaults to today)
   - Log type (radio buttons with icons):
     * 🧪 Experiment / Data Collection
     * 📄 Paper Review / Reading
     * 💡 Idea / Hypothesis
     * 📊 Result / Analysis
     * ✍️ Writing
     * 📌 Other
   - Title (required, max 100 chars)
   - Content (required, markdown textarea, min 50 chars)
   - Tags (optional, press Enter to add)
   - Visibility toggle: Public 🌍 | Private 🔒

   On submit:
   - Create /research_logs/{logId} in Firestore
   - Update /research_graph/{userId}:
     * Add date to loggedDates array
     * Recalculate currentStreak
     * Recalculate longestStreak
     * Recalculate totalLogDays
     * Update last30DayCount
   - Show success toast: "Research log saved! 🔥 Keep your streak going"

2. STREAK CALCULATION LOGIC (utility function)

   calculateStreak(loggedDates: string[]): {
     currentStreak: number;
     longestStreak: number;
     totalLogDays: number;
     last30DayCount: number;
   }

   - Sort dates descending
   - currentStreak: count consecutive days from today backwards
   - If today has no log but yesterday does, streak is still active (grace period)
   - longestStreak: find longest consecutive sequence in all dates
   - last30DayCount: count dates within last 30 days

3. RESEARCH GRAPH COMPONENT

   Props: { userId: string; isOwnProfile: boolean }
   
   - Fetch /research_graph/{userId} from Firestore
   - Render 52-week grid (364 days + partial current week)
   - Grid starts from Monday of the week 52 weeks ago
   - Each cell is a div with appropriate class based on loggedDates Set
   - Tooltip on hover showing date and status
   - Month labels positioned correctly above columns
   - Streak badge: "🔥 X day streak" shown prominently

4. LOG FEED (at /profile/:uid/logs)
   - Chronological list of all research logs
   - Filter by type (tabs)
   - Private logs shown with 🔒 icon (own profile only)
   - Each log is expandable (accordion)
   - Markdown rendered in content

All streak data must be updated atomically using Firestore transactions
to prevent race conditions.
```

---
---

# PHASE 3 — Lab System & Discovery
## 연구실 페이지 + 디스커버리 피드

---

## Prompt 3-1: Lab 페이지 시스템

```
Build the Lab (Research Lab) system for THE ERUDIS.

This is the core differentiating feature. A Lab is like a LinkedIn Company Page 
but specifically for academic research labs.

ROUTES:
- /lab/create — Create new lab (Professors only)
- /lab/:labId — Lab profile page
- /lab/:labId/settings — Lab settings (PI only)

1. CREATE LAB PAGE (/lab/create)
   Professor role required. Show permission error for other roles.
   
   Form fields:
   - Lab name (required)
   - Institution / University name (required)
   - Department
   - Research areas (multi-select, max 5)
   - Lab description (markdown, max 500 chars)
   - Lab website URL (optional)
   - Require post approval toggle (posts from members need PI approval before publishing)
   
   On submit: create /labs/{labId} document, add labId to user's labIds array

2. LAB PROFILE PAGE (/lab/:labId)

   Sections:
   
   A. LAB HEADER
      - Lab logo/avatar (default: initials on #1D9E75 background)
      - Lab name (large)
      - Institution name
      - Research areas (pills)
      - Member count | Follower count | Post count
      - Follow button | Share button
      - "Open Position" badge if active job posts exist
   
   B. ABOUT
      - Description text
      - PI (Professor) card with avatar, name, title
      - Website link
   
   C. MEMBERS GRID
      - Show all lab members with avatar, name, role
      - Click → goes to their profile
      - PI has special crown/star badge
      - "Invite Member" button (PI only)
   
   D. LAB FEED
      - All posts from this lab
      - Same PostCard component as home feed
      - Filter tabs: All | Updates | Papers | Results
      - Post composer if user is a member
   
   E. PUBLICATIONS
      - Papers linked to this lab
      - Sorted by date descending
   
   F. OPEN POSITIONS (if any)
      - Job cards for active positions

3. MEMBER INVITE SYSTEM
   
   PI can invite members by email:
   - Input: email address + role selector (PhD/Postdoc/Researcher)
   - Creates /lab_invites/{inviteId} in Firestore:
     { labId, invitedEmail, role, status: 'pending', createdAt }
   - Invited user sees notification: "Prof. X invited you to join [Lab Name]"
   - Accept → adds user to lab's memberIds, adds labId to user's labIds
   - Decline → updates invite status

4. POST FAN-OUT LOGIC
   When a lab member creates a post with labId set:
   - Post appears in the author's personal feed
   - Post appears in the lab's feed  
   - Post fans out to ALL followers of the lab (write to their /feed/{uid}/items/)
   - Post fans out to ALL followers of the author
   - Deduplicate (user follows both lab and author → show once)
   
   Implement this as a Firebase Cloud Function triggered on post creation.

5. LAB SETTINGS (/lab/:labId/settings) — PI only
   - Edit lab info
   - Manage members (remove, change role)
   - Toggle post approval requirement
   - Pending posts queue (if approval enabled)
   - Delete lab (with confirmation)

A user can belong to multiple labs simultaneously.
Show all lab affiliations on user profile.
```

---

## Prompt 3-2: Discovery Feed 구현

```
Build the Discovery Feed page at route /discover for THE ERUDIS.

This is the "daily news" experience. Users open this page to see 
what's trending in their field, like reading a newspaper.

LAYOUT:
- Full-width main content
- Field filter pills sticky at top
- Tab navigation below pills
- Infinite scroll feed

1. FIELD FILTER PILLS (sticky, horizontal scroll on mobile)
   
   Options: All Fields | Neuroscience | AI / ML | Quantum Physics | 
   Molecular Biology | Linguistics | Economics | Computer Science | 
   Chemistry | Physics | Mathematics | Psychology | + Add Field
   
   - Selected pill: #1D9E75 background, white text
   - Unselected: border #333, gray text
   - "+" Add Field opens a modal to add custom field
   - User's field preferences saved to their profile

2. TABS
   
   - Trending (default)
   - Most Resonated  
   - Most Viewed
   - New Papers
   - Following (posts from people/labs you follow)
   
   Each tab fetches differently:

   TRENDING:
   - Score = (resonateCount × 2) + viewCount + (commentCount × 3)
   - Time decay: score × (1 / hours_since_posted ^ 0.5)
   - Show posts from last 7 days only
   - Filter by selected field
   
   MOST RESONATED:
   - Sort by resonateCount desc
   - Period selector: Today | This Week | This Month
   
   MOST VIEWED:
   - Sort by viewCount desc
   - Period selector: Today | This Week | This Month
   
   NEW PAPERS:
   - Only posts with type === 'paper'
   - Sort by createdAt desc

3. POST CARDS IN DISCOVERY
   
   Same PostCard component but add:
   - Rank number badge (#1, #2, #3 etc.) with #1 in gold
   - Trending badge 🔥 for rank 1-3
   - "Breaking" badge for posts < 6 hours old with high engagement

4. AI WEEKLY BRIEF BANNER
   
   Show at top of Discovery feed every Monday:
   - Card with gradient background
   - "Your Weekly Research Brief is ready →"
   - Links to /brief page
   - Dismiss button (hides until next Monday)

5. SEARCH
   - Search bar at top (always visible in discovery)
   - Search across: posts, papers, researchers, labs
   - Results grouped by type with tabs
   - Highlight matching terms in results
   - Recent searches saved locally

Implement proper Firestore indexes for all query combinations.
Add loading skeletons that match the PostCard layout.
```

---

## Prompt 3-3: Resonate 시스템 완성

```
Implement the complete Resonate system for THE ERUDIS.

CRITICAL: This platform uses "Resonate" not "Like". 
Never use the word "like" anywhere in the UI or code variable names.
Use: resonateCount, isResonated, handleResonate, ResonateButton

1. RESONATE BUTTON COMPONENT
   
   Props: { postId: string; initialCount: number; initialIsResonated: boolean }
   
   UI:
   - Icon: wave/sound wave SVG icon (not heart, not thumbs up)
   - Text: "Resonate" + count
   - Default state: border #333, gray text
   - Active/resonated state: background #1D9E75, white text
   - Hover state: border #1D9E75, #1D9E75 text
   - Count animates +1/-1 on toggle
   
   Behavior:
   - Optimistic update (update UI immediately, then sync Firestore)
   - If sync fails, revert UI and show error toast
   
   Firestore operations:
   - Resonate: 
     * Create /resonates/{postId}/users/{userId}
     * Increment post's resonateCount using FieldValue.increment(1)
   - Un-resonate:
     * Delete /resonates/{postId}/users/{userId}
     * Decrement post's resonateCount using FieldValue.increment(-1)
   
   Check if user has resonated on load:
   - Read /resonates/{postId}/users/{currentUserId}
   - If document exists → isResonated = true

2. RESONATE NOTIFICATION
   
   When someone resonates your post:
   - Create /notifications/{userId}/items/{notifId}:
     { type: 'resonate', fromUserId, postId, postTitle, createdAt, isRead: false }
   - Show in notification bell (unread count badge)

3. NOTIFICATION SYSTEM
   
   Notification bell in navbar:
   - Badge showing unread count (red dot if > 0)
   - Click → dropdown/panel showing last 20 notifications
   
   Notification types and messages:
   - resonate: "[Name] resonated your post"
   - comment: "[Name] commented on your post"  
   - follow: "[Name] started following you"
   - lab_invite: "Prof. [Name] invited you to join [Lab]"
   - mention: "[Name] mentioned you in a post"
   - profile_visit (Pro only): "[Name] from [Institution] viewed your profile"
   
   Mark all as read button.
   Click notification → navigate to relevant content.
   
   Real-time: use Firestore onSnapshot listener for live updates.

4. RESONATE LEADERBOARD DATA
   
   Create a Cloud Function that runs daily:
   - Calculates top 10 resonated posts per research field for last 7 days
   - Writes to /leaderboards/{field}/weekly
   - Used by Discovery Feed "Most Resonated" tab and AI Brief

All Firestore security rules must be set so:
- Users can only resonate as themselves (not as others)
- resonateCount can only be modified server-side or with correct uid
```

---
---

# PHASE 4 — Profile Visitor System & Jobs
## 방문자 시스템 + 구인구직

---

## Prompt 4-1: 프로필 방문자 시스템

```
Build the Profile Visitor tracking system for THE ERUDIS.

This is a key monetization feature. Free users see limited visitor data,
Pro users see full analytics — driving subscription conversion.

1. VISITOR TRACKING
   
   When User A visits User B's profile page:
   - Write to /profile_visits/{userBId}/visitors/{userAId}:
     {
       visitorId: userA.uid,
       visitorName: userA.name,
       visitorAvatarUrl: userA.avatarUrl,
       visitorInstitution: userA.institution,
       visitorRole: userA.role,
       visitCount: increment,
       lastVisitAt: serverTimestamp(),
       isInstitutionHR: userA.role === 'institution_admin'
     }
   - Use Firestore merge to increment visitCount if already exists
   - Do NOT track own profile views
   - Do NOT track views from unauthenticated users

2. VISITOR DISPLAY — FREE TIER
   
   On profile page "Visitors" section:
   - Title: "X people viewed your profile this week"
   - Show first 3 visitors with: avatar, name, institution, role, time
   - Remaining visitors: blurred cards (CSS blur filter: 6px)
   - Over blurred cards: lock icon + "Upgrade to Pro to see all visitors"
   - Upgrade button → /pricing page

3. VISITOR DISPLAY — PRO TIER
   
   Full visitor analytics panel:
   
   Summary stats row:
   - This week's profile views (number)
   - Paper views this week (number)  
   - New followers this week (number)
   
   Full visitor list:
   - All visitors from last 30 days
   - Each row: avatar | name + institution | role | visit count | last visit time
   - Sort by: Most Recent | Most Visits | Institution
   - Filter by role: All | Professor | PhD | Postdoc | Institution HR
   
   Analytics breakdown:
   - Top visiting institutions (bar chart or list with counts)
   - Visitor role distribution (simple percentage bars)
   
   SPECIAL ALERT — HR Visits:
   - If visitor has role === 'institution_admin' AND visitCount >= 3:
     Show special highlighted alert card:
     "⭐ An HR team at [Institution Name] has visited your profile [X] times"
     Background: subtle gold/yellow tint
     This alert is extremely motivating for job-seeking PhD students

4. VISITOR NOTIFICATION
   
   Push notification when someone views your profile:
   - Free users: "Someone from [Institution] viewed your profile" (blurred name)
   - Pro users: "[Name] from [Institution] viewed your profile"
   - Don't send notification for every view — only first view per visitor per week
   
   Show in notification bell with eye icon.

5. COFFEE CHAT SYSTEM
   
   "Request a Chat" button on every profile:
   
   Modal when clicked:
   - Shows: visitor's avatar, name, institution
   - Message textarea: "What would you like to discuss?" (optional, max 200 chars)
   - Proposed duration: 30 min (default)
   - Calendly/calendar link field (optional)
   - Send Request button
   
   Free users: 3 requests/month limit. Show counter "X/3 requests used this month"
   Pro users: unlimited
   
   Received requests appear in /messages or a dedicated Coffee Chat inbox.
   Accept/Decline buttons with optional message.
   
   Store in Firestore: /coffee_chats/{chatId}
   { fromUserId, toUserId, message, status: 'pending'|'accepted'|'declined', createdAt }
```

---

## Prompt 4-2: 구인구직 (Jobs) 시스템

```
Build the Jobs/Positions system for THE ERUDIS at route /jobs.

IMPORTANT TERMINOLOGY: Use "Position" not "Job" in the UI.
But route and code can use /jobs for simplicity.

1. JOBS LIST PAGE (/jobs)
   
   Layout:
   - Search bar at top
   - Filter sidebar (left) or filter pills (top):
     * Position type: Tenure-track | Postdoc | PhD Position | Research Scientist | Industry
     * Location: Any | USA | Europe | Asia | Remote
     * Field: (same field options as Discovery)
     * Institution type: University | Research Institute | Industry | Government
   - Position cards in main area
   - Sort: Newest | Deadline soon | Most relevant

   Position Card shows:
   - Institution logo/avatar
   - Position title (bold)
   - Institution name + department
   - Location
   - Position type badge (color coded)
   - Application deadline (red if < 7 days)
   - Posted date
   - "Sponsored" badge if paid placement
   - Save/bookmark button
   - "Apply" → external URL or /jobs/:jobId

2. JOB DETAIL PAGE (/jobs/:jobId)
   
   Full position details:
   - All fields from card
   - Full description (markdown rendered)
   - Requirements list
   - What we offer section
   - About the institution section (links to institution page)
   - About the Lab section (if linked to a lab)
   - Apply button (external link OR application form)
   - Share button
   - Similar positions sidebar

3. POST A POSITION (/jobs/post) — Institution/Professor accounts only
   
   Form:
   - Position title
   - Position type (dropdown)
   - Department
   - Institution (auto-filled from user's institution)
   - Lab (optional, dropdown of PI's labs)
   - Location + Remote option
   - Description (markdown editor, min 200 chars)
   - Requirements (bullet list input)
   - Application deadline (date picker)
   - Application URL (external) OR use platform application
   - Salary/stipend range (optional)
   
   Free tier: 3 active positions max
   Paid tier: unlimited (Starter plan and above)
   Sponsored positions (paid): appear at top of relevant searches

4. SAVED POSITIONS
   
   Bookmark icon on position cards saves to /users/{uid}/saved_jobs/{jobId}
   Accessible at /profile → Saved tab

5. "OPEN TO OPPORTUNITIES" TOGGLE
   
   In user profile settings:
   - Toggle: "Open to Opportunities / Open to Collaborate"
   - Sub-options (multi-select):
     * Looking for Postdoc positions
     * Looking for Faculty positions  
     * Open to industry positions
     * Open to collaboration
     * Available for consulting
   - When enabled: green badge on profile
   - Boosts profile in Candidate Search results (institutional feature)
   - Private: only institution accounts with Candidate Search can filter by this

Show "Be the first to apply" if position was posted < 24 hours ago.
```

---
---

# PHASE 5 — AI Features & Monetization
## AI 기능 + 결제 시스템

---

## Prompt 5-1: AI Research Brief 시스템

```
Build the AI Research Brief system for THE ERUDIS.

This is the primary individual monetization feature. 
4-week free trial → $19/month conversion.

1. BRIEF SUBSCRIPTION ONBOARDING
   
   Page: /brief/setup (shown after registration if not set up)
   
   Step 1: Select your research fields
   - Multi-select pills (same field list as Discovery)
   - Min 1, max 5 fields
   - "The more specific, the better your Brief"
   
   Step 2: Preview a sample Brief
   - Show a static sample Brief for their selected field
   - "This is what you'll receive every Monday morning"
   
   Step 3: Confirm free trial
   - "Start your 4-week free trial"
   - No credit card required for trial
   - Show trial end date
   - Create /brief_subscriptions/{userId} in Firestore

2. BRIEF PAGE (/brief)
   
   Shows the current week's AI Research Brief.
   
   Header:
   - "Your Research Brief"
   - Week of [date]
   - Field badges showing subscribed fields
   
   Content sections:
   
   A. THIS WEEK'S HIGHLIGHTS (3-5 papers)
      Each paper card:
      - Rank badge (#1, #2...)
      - Badge: "Most Resonated" | "Breaking" | "Highly Viewed"
      - Paper title
      - Authors + institution
      - AI-generated 3-sentence summary (Pro only — blurred for free after trial)
      - "View on The Erudis" | "View on arXiv" links
      - Resonate button
   
   B. TREND ANALYSIS (Pro only)
      - "This Week's Emerging Topics in [Field]"
      - 3-5 bullet points generated by AI
      - Blurred with "Upgrade to Pro" overlay for free users
   
   C. FROM YOUR NETWORK
      - Papers/posts from people you follow
      - "Your colleagues are working on..."
   
   Free vs Pro gating:
   - Free (during trial): full access
   - Free (after trial): titles visible, summaries blurred, upgrade prompt
   - Pro: full access + cross-field trending + email delivery

3. FIREBASE FUNCTION — BRIEF GENERATOR
   
   Scheduled function: every Monday 06:00 UTC
   
   ```javascript
   exports.generateWeeklyBrief = functions.pubsub
     .schedule('0 6 * * 1')  // Every Monday 6am UTC
     .timeZone('UTC')
     .onRun(async (context) => {
       
       // 1. Get all active brief subscribers
       const subscribers = await db.collection('brief_subscriptions')
         .where('isActive', '==', true)
         .get();
       
       // 2. For each unique field combination, fetch papers
       const fieldGroups = groupSubscribersByFields(subscribers);
       
       for (const [fields, userIds] of fieldGroups) {
         
         // 3. Fetch from arXiv API
         const papers = await fetchArxivPapers(fields, 7); // last 7 days
         
         // 4. Get platform Resonate data for ranking
         const rankedPapers = await rankByPlatformEngagement(papers);
         
         // 5. Generate AI summaries via OpenAI
         const summaries = await generateSummaries(rankedPapers.slice(0, 5));
         
         // 6. Store brief in Firestore
         await db.collection('weekly_briefs').add({
           fields,
           weekOf: getMonday(new Date()),
           papers: summaries,
           createdAt: admin.firestore.FieldValue.serverTimestamp()
         });
         
         // 7. Send email to subscribers via Resend
         for (const userId of userIds) {
           await sendBriefEmail(userId, summaries);
         }
       }
     });
   ```
   
   arXiv API call:
   ```javascript
   async function fetchArxivPapers(fields: string[], days: number) {
     const query = fields.map(f => `cat:${fieldToArxivCategory(f)}`).join('+OR+');
     const url = `https://export.arxiv.org/api/query?search_query=${query}&sortBy=submittedDate&sortOrder=descending&max_results=50`;
     const response = await fetch(url);
     // parse XML response
   }
   ```
   
   OpenAI API call:
   ```javascript
   async function generateSummaries(papers) {
     const response = await fetch('https://api.anthropic.com/v1/messages', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
         'x-api-key': process.env.ANTHROPIC_API_KEY,
       },
       body: JSON.stringify({
         model: 'claude-sonnet-4-20250514',
         max_tokens: 1000,
         messages: [{
           role: 'user',
           content: `Summarize these academic papers in 2-3 sentences each. 
                    Focus on the key finding and why it matters.
                    Return JSON array with: {title, summary, significance}
                    Papers: ${JSON.stringify(papers.map(p => ({ title: p.title, abstract: p.abstract })))}`
         }]
       })
     });
     return response.json();
   }
   ```

4. TRIAL EXPIRY HANDLING
   
   Firebase Function: runs daily, checks trial end dates
   - If trial expired and no subscription: 
     * Update brief_subscription.isActive = false
     * Send email: "Your Research Brief trial has ended"
     * Create in-app notification with upgrade prompt
   - Show trial countdown banner on /brief page: "X days left in your free trial"
```

---

## Prompt 5-2: 결제 시스템 (Stripe)

```
Build the subscription and payment system for THE ERUDIS using Stripe.

Plans:
- Pro: $19/month (AI Research Brief + visitor analytics + paper summaries)
- Pro + Write: $29/month (Pro + AI writing assistance)  
- Lab Pro: $49/month (for Professors — unlimited lab members + lab analytics)

1. PRICING PAGE (/pricing)
   
   Three plan cards:
   
   FREE (current for most)
   - Research feed & posting
   - Lab membership
   - Basic profile
   - Research Graph
   - AI Brief (4-week trial)
   - 3 Coffee Chat requests/month
   Price: $0
   CTA: "Get Started"
   
   PRO — $19/month
   - Everything in Free
   - Full AI Research Brief (weekly email)
   - AI paper instant summary
   - Full profile visitor list + analytics
   - Unlimited Coffee Chat
   - Cross-field trending reports
   Price: $19/month
   CTA: "Start Free Trial" (highlights that trial exists)
   Badge: "Most Popular"
   
   PRO + WRITE — $29/month
   - Everything in Pro
   - AI writing assistant (literature review, abstract structuring, grammar)
   - Reference formatter (APA, MLA, Chicago)
   Price: $29/month
   CTA: "Start Free Trial"
   
   LAB PRO — $49/month  
   - For Professors/PIs
   - Unlimited lab members (free: 10 max)
   - Lab analytics dashboard
   - Private research tracking
   - Lab annual report generation
   Price: $49/month
   CTA: "Upgrade Lab"
   
   Annual discount toggle: show 20% discount if billed annually

2. STRIPE CHECKOUT FLOW
   
   Firebase Function: createCheckoutSession
   ```javascript
   exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
     if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
     
     const { priceId } = data;
     
     const session = await stripe.checkout.sessions.create({
       customer_email: context.auth.token.email,
       mode: 'subscription',
       payment_method_types: ['card'],
       line_items: [{ price: priceId, quantity: 1 }],
       success_url: `${BASE_URL}/settings/billing?success=true`,
       cancel_url: `${BASE_URL}/pricing`,
       metadata: { userId: context.auth.uid }
     });
     
     return { sessionId: session.id };
   });
   ```
   
   Frontend checkout button:
   ```javascript
   const handleUpgrade = async (priceId: string) => {
     const { sessionId } = await createCheckoutSession({ priceId });
     const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);
     await stripe!.redirectToCheckout({ sessionId });
   };
   ```

3. STRIPE WEBHOOK HANDLER
   
   Firebase Function: stripeWebhook
   
   Handle events:
   - checkout.session.completed → update user subscription in Firestore
   - customer.subscription.updated → update plan
   - customer.subscription.deleted → downgrade to free
   - invoice.payment_failed → send payment failed email + notification
   
   ```javascript
   exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
     const sig = req.headers['stripe-signature']!;
     const event = stripe.webhooks.constructEvent(req.rawBody, sig, WEBHOOK_SECRET);
     
     switch (event.type) {
       case 'checkout.session.completed':
         const session = event.data.object;
         await db.doc(`subscriptions/${session.metadata.userId}`).set({
           plan: getPlanFromPriceId(session.line_items),
           status: 'active',
           stripeCustomerId: session.customer,
           stripeSubscriptionId: session.subscription,
           currentPeriodEnd: session.current_period_end,
         });
         // Also update user.subscription field
         await db.doc(`users/${session.metadata.userId}`).update({
           subscription: getPlanFromPriceId(session.line_items)
         });
         break;
     }
     res.json({ received: true });
   });
   ```

4. BILLING SETTINGS PAGE (/settings/billing)
   
   - Current plan display with features list
   - Next billing date
   - Payment method (last 4 digits of card)
   - "Update payment method" → Stripe customer portal
   - "Cancel subscription" → confirmation modal → Stripe cancel
   - Invoice history (list of past payments)
   - Success state when returning from checkout: confetti + "Welcome to Pro! 🎉"

5. FEATURE GATING
   
   Create a useSubscription() hook:
   ```typescript
   const useSubscription = () => {
     const { user } = useAuth();
     return {
       isPro: ['pro', 'pro_write', 'lab_pro'].includes(user?.subscription),
       isProWrite: user?.subscription === 'pro_write',
       isLabPro: user?.subscription === 'lab_pro',
       isFree: user?.subscription === 'free',
     };
   };
   ```
   
   Create a <ProGate> component:
   ```typescript
   // Wraps content that requires Pro subscription
   // Shows blurred content + upgrade prompt if not Pro
   <ProGate feature="visitor_analytics">
     <VisitorAnalytics />
   </ProGate>
   ```

Stripe keys stored in Firebase Functions environment config, never in frontend.
```

---

## Prompt 5-3: 최종 마무리 & 배포

```
Perform final setup and optimization for THE ERUDIS before deploying to theerudis.com.

1. FIRESTORE SECURITY RULES
   
   Write complete Firestore security rules:
   
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       
       // Users can read any profile, only write their own
       match /users/{userId} {
         allow read: if request.auth != null;
         allow write: if request.auth.uid == userId;
       }
       
       // Posts: public posts readable by all authenticated users
       match /posts/{postId} {
         allow read: if request.auth != null && 
           (resource.data.visibility == 'public' || 
            request.auth.uid == resource.data.authorId);
         allow create: if request.auth != null;
         allow update, delete: if request.auth.uid == resource.data.authorId;
       }
       
       // Resonates: users can only create/delete their own
       match /resonates/{postId}/users/{userId} {
         allow read: if request.auth != null;
         allow create, delete: if request.auth.uid == userId;
       }
       
       // Labs: anyone can read, only PI can write
       match /labs/{labId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth.uid == resource.data.piId;
       }
       
       // Feed: users can only read their own feed
       match /feed/{userId}/items/{itemId} {
         allow read: if request.auth.uid == userId;
         allow write: if false; // Only written by Cloud Functions
       }
       
       // Profile visits: anyone can create, only owner can read
       match /profile_visits/{userId}/visitors/{visitorId} {
         allow read: if request.auth.uid == userId;
         allow create: if request.auth != null && request.auth.uid != userId;
       }
       
       // Subscriptions: only owner can read/write
       match /subscriptions/{userId} {
         allow read: if request.auth.uid == userId;
         allow write: if false; // Only written by Cloud Functions (Stripe webhook)
       }
     }
   }
   ```

2. PERFORMANCE OPTIMIZATION
   
   - Implement React.lazy() and Suspense for all page components
   - Add loading skeletons for all async data
   - Memoize expensive components with React.memo
   - Use Firestore onSnapshot only for real-time needs (notifications, feed)
   - Use one-time get() for static data (profile, lab info)
   - Implement proper Firestore pagination with startAfter cursors
   - Add index.ts barrel exports for clean imports

3. SEO & META TAGS
   
   Using react-helmet-async:
   - Dynamic meta tags for profile pages: "Prof. [Name] — THE ERUDIS"
   - Dynamic meta tags for lab pages: "[Lab Name] at [Institution] — THE ERUDIS"  
   - OpenGraph tags for social sharing
   - Canonical URLs
   - robots.txt: allow all except /settings, /billing

4. ERROR HANDLING
   
   - Global error boundary component
   - 404 page with navigation back to /feed
   - Network error toast with retry button
   - Firebase quota exceeded handling
   - Auth session expired: auto-redirect to /login with return URL

5. ENVIRONMENT & DEPLOYMENT
   
   .env.local (never commit to git):
   REACT_APP_FIREBASE_API_KEY=
   REACT_APP_FIREBASE_AUTH_DOMAIN=
   REACT_APP_FIREBASE_PROJECT_ID=
   REACT_APP_FIREBASE_STORAGE_BUCKET=
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
   REACT_APP_FIREBASE_APP_ID=
   REACT_APP_STRIPE_PUBLIC_KEY=
   
   vercel.json:
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   
   Firebase Functions .env:
   STRIPE_SECRET_KEY=
   STRIPE_WEBHOOK_SECRET=
   ANTHROPIC_API_KEY=
   RESEND_API_KEY=
   
   Deploy commands:
   - Frontend: git push origin main (Vercel auto-deploys)
   - Functions: firebase deploy --only functions
   - Firestore rules: firebase deploy --only firestore:rules

6. ANALYTICS
   
   Add Firebase Analytics events:
   - user_registered
   - post_created (with type property)
   - resonated (with postId)
   - lab_created
   - research_log_saved
   - brief_trial_started
   - subscription_started (with plan)
   - profile_visited
   
   These events will be critical for understanding user behavior 
   and optimizing conversion funnels.
```

---

# 개발 구현 현황 (Implementation Log)

> **최종 갱신:** 2026-05-15  
> **저장소:** `great-simonlee/erudis` · **Firebase 프로젝트:** `erudis-47097`  
> **프론트:** React 19 + TypeScript (CRA) · **백엔드:** Firebase Auth / Firestore / Storage (Cloud Functions **미구현**)  
> 이 섹션은 위 5-Phase 프롬프트 대비 **실제 코드베이스에 구현된 내용**을 파일·경로·규칙·델타까지 기록한다.

### 전체 완성도 요약

| Phase | 프롬프트 범위 | 구현 상태 | 비고 |
|-------|--------------|----------|------|
| **1** | 기반·인증·레이아웃 | **대부분 완료** | 온보딩 5단계 확장, `general` 회원, 이메일 검증 플래그로 우회 가능 |
| **2** | 피드·프로필·연구 로그 | **대부분 완료** | Lab-note 픽셀 과일 그래프, 프로필/커버 업로드, 무한 스크롤 피드 |
| **3** | 랩·디스커버·공명 | **부분 완료** | UI는 **Like(하트)** · Firestore는 `resonates` 유지; 디스커버 탭 단순화 |
| **4** | 방문자·커피챗·채용 | **대부분 완료** | Messages = Coffee Chat; Stripe/Pro 게이팅 UI만 |
| **5** | AI Brief·결제·배포 | **플레이스홀더** | `/brief`, `/pricing` 안내 페이지; Functions/Stripe 없음 |
| **추가** | 기관·기관 관리자 | **완료** | `institution_admin`, 학교/랩 로고·커버, 관리 콘솔 |

---

## 0. 프로젝트 구조 & 실행

### 0.1 디렉터리 (실제)

```
src/
├── components/
│   ├── ui/              Button, Input, Label, TextArea, PasswordInput
│   ├── layout/          Navbar, LeftSidebar, RightSidebar, MainLayout, MobileTabBar, NotificationBell
│   ├── shared/          AuthGuard, EmailVerifiedGuard, OnboardedGuard, HomeRedirect, ThemeToggle, FirebaseNotice
│   ├── feed/            PostCard, PostCommentThread, FeedComposerBar, PostComposerModal
│   ├── profile/         EditableProfileBanner, ResearchActivityGraph, LabNotePixelGrid, CoffeeChatModal, ResearchLogModal, …
│   ├── lab/             InstitutionLabPicker
│   └── entity/          EditableEntityBanner (랩·기관 공통 배너/로고)
├── pages/
│   ├── auth/            Login, Register, VerifyEmail, ResetPassword
│   ├── onboarding/      OnboardingPage (5 steps)
│   ├── feed/            FeedPage
│   ├── discover/        DiscoverPage, BriefPage (placeholder)
│   ├── profile/         ProfilePage, ProfileLogsPage
│   ├── lab/             LabsPage, LabExplorePage, LabCreatePage, LabProfilePage, LabSettingsPage
│   ├── institution/     InstitutionProfilePage, InstitutionAdminPage
│   ├── jobs/            JobsPage, JobDetailPage, JobPostPage
│   ├── papers/          PapersPage
│   ├── messages/        MessagesPage (coffee chats)
│   ├── settings/        SettingsPage
│   └── pricing/         PricingPage (placeholder)
├── hooks/               useAuth, useFeedItems, useNotifications, useDemoEcosystemBootstrap
├── lib/                 firebase, createPost, postComments, profileMedia, entityMedia, institutions, institutionAccess, …
├── contexts/            AuthContext, ThemeContext, ToastContext
├── constants/           routes, researchFields, institutions catalog, labNotePortraits, openToWork
├── types/               index.ts (전체 도메인 타입)
├── utils/               academicEmail, onboardingGate, follow, labSearch, roleLabels, …
├── config/              flags.ts
└── dev/                 seed/link demo helpers
scripts/
├── seedFirestoreDemo.cjs
└── seedFirestoreDemoData.cjs
firestore.rules · firestore.indexes.json · storage.rules · firebase.json
```

### 0.2 npm 스크립트

| 명령 | 용도 |
|------|------|
| `npm run dev` / `start` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run test` | Jest (기본 CRA) |
| `npm run seed:firestore` | Admin SDK 데모 데이터 시드 |
| `npm run deploy:indexes` | Firestore 인덱스만 배포 |

### 0.3 환경 변수 (`.env.local`)

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_ENABLE_DUMMY_SEED=true   # 선택: 피드 데모 시드 UI
```

### 0.4 기능 플래그 (`src/config/flags.ts`)

| 플래그 | 기본값 | 의미 |
|--------|--------|------|
| `skipFirebase` | `false` | `true`면 Auth 없이 셸만 (개발용) |
| `useCentralVerificationInbox` | `true` | Auth 이메일을 `info+...@theerudis.com` 별칭으로 (스테이징) |
| `requireEmailVerification` | `false` | `true`면 이메일 인증 후 온보딩 |
| `extraInstitutionalEmailDomains` | `['misaeng.com']` | 학교 메일 휴리스틱 추가 도메인 |
| `enableDummyFeedSeed` | dev 또는 env | FeedPage에서 샘플 데이터 버튼 |

### 0.5 배포 명령 (규칙 반영 시)

```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only storage
npm run seed:firestore   # gcloud ADC 또는 GOOGLE_APPLICATION_CREDENTIALS
```

---

## 1. PHASE 1 — Foundation & Authentication

### 1.1 Prompt 1-1: 프로젝트 초기 세팅 — ✅ 구현됨

| 항목 | 구현 파일 / 내용 |
|------|------------------|
| Firebase 초기화 | `src/lib/firebase.ts` — Auth, Firestore, Storage (null-safe) |
| 타입 정의 | `src/types/index.ts` — 프롬프트보다 **확장** (아래 스키마 참고) |
| 상수·라우트 | `src/constants/index.ts`, `researchFields.ts`, `institutions.ts` |
| Tailwind 테마 | `tailwind.config.js` — brand `#1D9E75`, `surface`/`fg` CSS 변수, Playfair Display |
| 다크/라이트 | `src/contexts/ThemeContext.tsx` + `ThemeToggle` |

**프롬프트 대비 타입 확장:**

- `UserRole`: `research_scientist`, `industry_researcher`, `general`, `pending`, `institution_admin`
- `User`: `signupIntent`, `institutionName`, `labOnboardingIntent`, `openToWork[]`, `coverUrl`, `labNoteStoryGlyphs`, `labNoteStoryPortrait`
- `Institution` 컬렉션 타입 **신규**
- `Lab`: `institutionName`, `department`, `websiteUrl`, `coverUrl`
- `JobPost`, `CoffeeChat`, `NotificationItem`, `FeedItem`, `ResearchGraph`, `Paper` 등

### 1.2 Prompt 1-2: 인증 시스템 — ✅ 대부분 (플래그·일반 회원 확장)

| 페이지 | 경로 | 파일 | 구현 내용 |
|--------|------|------|-----------|
| 회원가입 | `/register` | `RegisterPage.tsx` | 이름·이메일·비밀번호; **학교 메일** 또는 **General member** 체크; 비밀번호 규칙: 대소문자·숫자·특수문자·11자 이상; Firestore `users/{uid}` 생성 (`role: pending`, `coverUrl: ''`) |
| 이메일 인증 | `/verify-email` | `VerifyEmailPage.tsx` | 재전송·폴링; `requireEmailVerification`이 false면 사실상 우회 |
| 로그인 | `/login` | `LoginPage.tsx` | `mapAuthError`; 온보딩 완료 여부에 `/feed` vs `/onboarding` |
| 비밀번호 재설정 | `/reset-password` | `ResetPasswordPage.tsx` | `sendPasswordResetEmail` |
| 온보딩 | `/onboarding` | `OnboardingPage.tsx` | **5단계** (아래) |

**학교 이메일 검증:** `src/utils/academicEmail.ts` — `.edu`, `.ac.kr`, `.ac.uk` 등 TLD + `extraInstitutionalEmailDomains`

**인증 이메일 별칭:** `src/utils/verificationInbox.ts` — `useCentralVerificationInbox` 시 Auth에는 plus-address, Firestore `email`은 사용자가 입력한 주소 유지

**가드 체인 (`App.tsx`):**

1. `AuthGuard` — 미로그인 → `/login`
2. `EmailVerifiedGuard` — (플래그 on 시) 미인증 → `/verify-email`
3. `OnboardedGuard` — `isOnboardingComplete` false → `/onboarding`

**`useAuth`:** `src/hooks/useAuth.ts` + `src/contexts/AuthContext.tsx` — `user`, `profile`, `loading`, `refreshProfile`

**온보딩 5단계 (`OnboardingPage.tsx`):**

1. 역할 선택 (professor, phd, postdoc, research_scientist, industry_researcher, general) — `institution_admin`은 온보딩에서 선택 불가
2. 연구 분야 (최대 5, `RESEARCH_FIELD_CATALOG` 검색)
3. 기관 (`INSTITUTION_CATALOG` + custom + general은 스킵 가능)
4. Open to work (다중 선택, `openToWork.ts`)
5. 랩 의향: 가입 / 생성 / 나중에 — 교수는 랩 생성 플로우, `ensureInstitutionDoc` + `labs` 문서 생성 가능

**`institution_admin` 온보딩:** `src/utils/onboardingGate.ts` — `institutionId` + `institutionName`만 있으면 완료 (연구 분야·openToWork 불필요)

### 1.3 Prompt 1-3: 메인 레이아웃 & 네비게이션 — ✅ 구현 (일부 프롬프트와 UI 차이)

| 컴포넌트 | 파일 | 내용 |
|----------|------|------|
| MainLayout | `MainLayout.tsx` | 좌 240px / 메인 **전체 너비** (`max-w-3xl` 제거됨) / 우 300px; 플로팅 **연구 로그 +** 버튼 |
| LeftSidebar | `LeftSidebar.tsx` | Home, Discover, **Find labs**, My Labs, Papers, Jobs, Messages, My profile; **My institution** (`institution_admin`); Settings; 하단 아바타 |
| RightSidebar | `RightSidebar.tsx` | 트렌딩·추천·채용 요약 (Firestore 조회) |
| Navbar | `Navbar.tsx` | 모바일 상단 + `NotificationBell` |
| MobileTabBar | `MobileTabBar.tsx` | Home, Discover, Labs, Profile |

**라우트 전체 (`ROUTES` in `constants/index.ts`):**

| 키 | 경로 |
|----|------|
| login | `/login` |
| register | `/register` |
| verifyEmail | `/verify-email` |
| resetPassword | `/reset-password` |
| onboarding | `/onboarding` |
| feed | `/feed` |
| discover | `/discover` |
| brief | `/brief` |
| labs | `/labs` |
| labExplore | `/labs/explore` |
| labCreate | `/lab/create` |
| lab(id) | `/lab/:id` |
| labSettings(id) | `/lab/:id/settings` |
| institution(id) | `/institution/:id` |
| institutionManage(id) | `/institution/:id/manage` |
| papers | `/papers` |
| jobs | `/jobs` |
| jobsPost | `/jobs/post` |
| job(id) | `/jobs/:id` |
| messages | `/messages` |
| settings | `/settings` |
| pricing | `/pricing` |
| profile(uid) | `/profile/:uid` |
| profileLogs(uid) | `/profile/:uid/logs` |

---

## 2. PHASE 2 — Core Feed & Profile

### 2.1 Prompt 2-1: 홈 피드 — ✅ 구현

| 기능 | 구현 |
|------|------|
| 데이터 소스 | `feed/{uid}/items` — `useFeedItems.ts`, 페이지당 15, `startAfter` 페이지네이션 |
| PostCard | `PostCard.tsx` — 작성자·랩·타입 배지·Markdown·태그 |
| 공명/좋아요 | Firestore: `posts/{id}/resonates/{uid}`, `resonateCount` — **UI 라벨은 "Like" + 하트 아이콘** (프롬프트 Resonate와 불일치) |
| 댓글 | `PostCommentThread.tsx` + `postComments.ts` — **스레드 답글**, `parentCommentId`, 최대 깊이 **5** |
| 북마크 | `users/{uid}/bookmarks/{postId}` |
| 작성 | `FeedComposerBar` → `PostComposerModal` → `createPost.ts` `createPostAndFanOut` — 클라이언트 배치 fan-out (Functions 없음) |
| 가시성 | `public` / `members_only` / `private` — `firestoreAccess.getPostIfAllowed` |
| 로딩 | 스켈레톤, "Load more", 빈 상태 |
| 데모 시드 | `dev/seedDummyFeedData.ts`, `linkDemoEcosystem.ts`, FeedPage 버튼 (`enableDummyFeedSeed`) |

**Fan-out 로직 (`createPostAndFanOut`):** 작성자 `followers` + (랩 게시 시) 랩 `memberIds` / `labs/{id}/followers` 서브컬렉션 — 규칙에 맞게 `sourceLabId` 필드 설정

### 2.2 Prompt 2-2: 유저 프로필 — ✅ 대부분

| 섹션 | 구현 (`ProfilePage.tsx`) |
|------|-------------------------|
| 헤더 | `EditableProfileBanner` — **아바타·커버 Firebase Storage 업로드** (`profileMedia.ts`, `avatars/`, `covers/`) |
| 통계 | followers / following / resonates received / profile views |
| Follow | `utils/follow.ts` — `users.following` 배열 + `users/{id}/following|followers` 서브컬렉션 |
| Coffee Chat | `CoffeeChatModal` → `coffee_chats` 컬렉션 |
| 연구 활동 그래프 | `ResearchActivityGraph` — **Lab-note 스토리**: 픽셀 과일 실루엣, 평일 로그로 채움 (`labNotePortraits.ts`, `LabNotePixelGrid`) |
| 최근 로그 | 공개 `research_logs` 미리보기 |
| 게시물 | 작성자 `posts` 쿼리 + PostCard |
| 논문 | `papers` by `addedBy` |
| 랩 | `labIds`로 랩 카드 링크 |
| 방문자 (본인) | `profile_visits/{uid}/visitors` — Pro 게이트 UI (목록 제한/블러) |
| Lab-note 설정 | Settings에서 과일 모양·글리프 (프로필 그리드용) |

**프로필 로그 전용 페이지:** `/profile/:uid/logs` — `ProfileLogsPage.tsx`

**연구 로그 작성:** `ResearchLogModal` — `research_logs` + `research_graph/{uid}` streak 갱신 (`researchLogSubmit.ts`)

### 2.3 Prompt 2-3: Research Graph — ✅ (Lab-note 변형으로 구현)

- GitHub 스타일 히트맵 대신 **과일 픽셀 그리드** (apple / orange / watermelon)
- `research_graph` 문서: `loggedDates`, `currentStreak`, `longestStreak`, `totalLogDays`, `last30DayCount`
- 로그 저장 시 `storyGlyphId`로 어떤 과일 셀을 채울지 연동 가능

---

## 3. PHASE 3 — Social Layer (Labs, Discovery, Resonate)

### 3.1 Prompt 3-1: Lab System — ✅ + 기관 확장

| 기능 | 파일 | 설명 |
|------|------|------|
| My Labs | `LabsPage.tsx` | 내 `labIds` 목록 |
| Find labs | `LabExplorePage.tsx` | 학교 **필 버튼** + 검색; `utils/labSearch.ts` |
| 학교 피커 | `InstitutionLabPicker.tsx` | `INSTITUTION_CATALOG` + 플랫폼에 랩 있는 학교; **로고** (`mergeInstitutionLogos`); 선택 시 기관 프로필 링크 |
| 랩 프로필 | `LabProfilePage.tsx` | `EditableEntityBanner` — **로고·커버**; PI·멤버·게시물·채용·팔로우 |
| 랩 생성 | `LabCreatePage.tsx` | 교수만; `ensureInstitutionDoc` 후 `labs` 생성 |
| 랩 설정 | `LabSettingsPage.tsx` | 이름·설명·승인·멤버 UID·이메일 초대·채용 초안·삭제 — **PI 또는 institution_admin** |
| 랩 팔로우 | `labs/{id}/followers/{uid}` 서브컬렉션 |

**기관(학교) — 프롬프트 이후 추가:**

| 기능 | 파일 |
|------|------|
| 기관 프로필 | `InstitutionProfilePage.tsx` — 로고·커버·설명·소속 랩 목록 |
| 기관 관리 | `InstitutionAdminPage.tsx` — 기관 정보·랩 목록·구성원 **역할 변경** |
| 접근 제어 | `institutionAccess.ts` — `managesInstitution`, `canManageLab` |
| 기관 CRUD 헬퍼 | `institutions.ts` — `getInstitution`, `ensureInstitutionDoc`, `listLabsAtInstitution`, `listUsersAtInstitution`, `updateInstitutionProfile`, `updateInstitutionMemberRole` |
| 미디어 | `entityMedia.ts` — lab/institution logo & cover upload |

### 3.2 Prompt 3-2: Discovery Feed — ⚠️ 부분 구현

`DiscoverPage.tsx` 탭:

| 탭 ID | UI 라벨 | 동작 |
|-------|---------|------|
| trending | New | `visibility==public` 최신순 (점수·7일 decay **미구현**) |
| resonated | Most resonated | `resonateCount` 정렬 |
| viewed | Most viewed | `viewCount` 정렬 |
| papers | New papers | `type==paper` |
| following | Following | `authorId in following` (배치 제한) |

**미구현:** 순위 배지 #1 gold, Breaking 배지, 주간 Brief 배너, 통합 검색(게시물·논문·연구자·랩), 기간 선택기

### 3.3 Prompt 3-3: Resonate 시스템 — ⚠️ 데이터는 resonate, UI는 Like

| 프롬프트 | 실제 |
|----------|------|
| Resonate 버튼·웨이브 아이콘 | **Like** + 하트 (`PostCard.tsx`) |
| 경로 `/resonates/{postId}/users/{uid}` | `posts/{postId}/resonates/{resonatorId}` |
| 알림 | `notifyResonate` — 메시지 "Liked your post." |
| NotificationBell | `useNotifications.ts` — resonate, follow, lab_invite 등 |
| 일일 리더보드 Cloud Function | **없음** |

---

## 4. PHASE 4 — Engagement

### 4.1 Prompt 4-1: 프로필 방문자 — ✅

- 기록: `profile_visits/{visitedUid}/visitors/{visitorUid}` — 이름·기관·역할·`visitCount`·`lastVisitAt`
- `ProfilePage` 방문 시 `setDoc` merge
- Free vs Pro: UI에서 방문자 수·목록 제한/업셀 카피 (`subscription` 필드)
- 규칙: 본인만 read; 방문자만 create/update

### 4.2 Prompt 4-2: Coffee Chat — ✅ (Messages 페이지)

- 컬렉션: `coffee_chats/{id}` — `pending` / `accepted` / `declined`
- 요청: `CoffeeChatModal` on profile
- 수신함: `MessagesPage.tsx` — 수락/거절 (`coffeeChats.ts`, 인덱스 쿼리 + fallback)
- **실시간 DM 스레드는 없음** — 채팅 목록·상태만

### 4.3 Prompt 4-3: Jobs — ✅

| 페이지 | 기능 |
|--------|------|
| `JobsPage` | 목록·검색·position type·location·저장(`saved_jobs`) |
| `JobDetailPage` | 상세·마크다운 |
| `JobPostPage` | PI / institution_admin / 비랩 게시 |
| 규칙 | 랩 채용은 `canManageLab`; 개인 게시는 `postedByUserId` |

---

## 5. PHASE 5 — Monetization & Polish

| 프롬프트 항목 | 상태 |
|---------------|------|
| AI Weekly Brief (`/brief`) | **플레이스홀더** — Discover 링크만 |
| Stripe / 구독 결제 | **없음** — `PricingPage` 안내 문구만; `User.subscription` 필드는 시드·수동 설정 |
| Cloud Functions | **저장소에 functions 폴더 없음** |
| React.lazy / SEO helmet | **미적용** |
| Global error boundary / 404 | **미구현** |
| Firebase Analytics 이벤트 | **미구현** |

---

## 6. Firestore 데이터 모델 (실제 컬렉션)

| 컬렉션 | 문서 ID | 주요 필드 | 비고 |
|--------|---------|-----------|------|
| `users` | uid | profile 전체 | institution_admin이 동일 기관 user update 가능 |
| `users/{uid}/following` | targetUid | — | |
| `users/{uid}/followers` | followerUid | — | |
| `users/{uid}/bookmarks` | postId | — | |
| `users/{uid}/saved_jobs` | jobId | — | |
| `institutions` | slug id | name, logoUrl, coverUrl, description, websiteUrl, adminUserIds | **신규** |
| `labs` | auto | piId, memberIds, institutionId, logoUrl, coverUrl, … | update/delete: PI 또는 기관 admin |
| `labs/{id}/followers` | uid | — | |
| `lab_invites` | auto | labId, invitedEmail, status | |
| `posts` | auto | authorId, labId, visibility, resonateCount, … | |
| `posts/{id}/comments` | auto | parentCommentId | |
| `posts/{id}/resonates` | resonatorId | — | |
| `feed/{uid}/items` | auto | postId, authorId, sourceLabId? | fan-out |
| `notifications/{uid}/items` | auto | type, fromUserId, … | |
| `research_logs` | auto | userId, isPublic, storyGlyphId? | |
| `research_graph` | userId | streak fields | |
| `profile_visits/{uid}/visitors` | visitorUid | visitorName, visitCount, … | |
| `coffee_chats` | auto | fromUserId, toUserId, status | |
| `jobs` | auto | labId?, postedByUserId, active, … | |
| `papers` | auto | addedBy, doi, arxivId, … | |

### 6.1 Firestore 보안 규칙 요약 (`firestore.rules`)

- **기관 관리:** `canManageInstitution`, `institutionAdminListed`, `managesInstitutionId`
- **랩 관리:** `canManageLab` = PI 또는 해당 랩의 `institutionId` 기관 관리자
- **게시물 읽기:** `canViewPost` — 작성자 / public / members_only+랩 멤버
- **게시물 카운트:** 타인은 `resonateCount`·`commentCount`만 increment 패턴으로 update
- **팔로우:** 타인 `users.followers` 배열에 self add/remove (`followerListSelfUpdate`)
- **피드 쓰기:** 본인 / 팔로우 관계 / 랩 팔로워·멤버 fan-out 조건

### 6.2 Firestore 인덱스 (`firestore.indexes.json`)

- `posts`: authorId+createdAt, visibility+createdAt, labId+createdAt
- `lab_invites`: labId+createdAt
- `research_logs`: userId+createdAt, userId+isPublic+createdAt
- `papers`: addedBy+createdAt
- `jobs`: active+createdAt
- `coffee_chats`: toUserId+createdAt, fromUserId+createdAt

---

## 7. Firebase Storage (`storage.rules`)

| 경로 | 쓰기 권한 | 크기 |
|------|-----------|------|
| `avatars/{userId}/*` | 본인 | 5MB 이미지 |
| `covers/{userId}/*` | 본인 | 8MB |
| `lab-logos/{labId}/*` | `canManageLab` | 5MB |
| `lab-covers/{labId}/*` | `canManageLab` | 8MB |
| `institution-logos/{institutionId}/*` | `canManageInstitution` | 5MB |
| `institution-covers/{institutionId}/*` | `canManageInstitution` | 8MB |

---

## 8. 데모 데이터 시드 (`npm run seed:firestore`)

**파일:** `scripts/seedFirestoreDemo.cjs` + `seedFirestoreDemoData.cjs`

| 항목 | 내용 |
|------|------|
| 기관 5곳 | MIT, Stanford, Berkeley, Cambridge, Harvard — `institutions` 문서 |
| MIT 기관 관리자 | `erudis_demo_inst_admin_mit` — role `institution_admin` |
| 사용자 | 교수 3, PhD 2, postdoc, researcher, research scientist 등 |
| 랩 3 | MIT / Stanford / Berkeley demo labs |
| 게시물·채용·논문·연구 로그·coffee_chats·research_graph | 풍부한 UI 리뷰용 |

**앱 내 연동:** `REACT_APP_ENABLE_DUMMY_SEED` 또는 dev에서 Feed **Load sample data** → `useDemoEcosystemBootstrap` / `linkDemoEcosystem.ts`

**대표 URL:**

- `/institution/massachusetts-institute-of-technology`
- `/institution/massachusetts-institute-of-technology/manage` (admin 로그인 시)
- `/profile/erudis_demo_inst_admin_mit`

---

## 9. `institution_admin` 운영 가이드

1. Firestore `users/{uid}`:
   - `role: "institution_admin"`
   - `institutionId`, `institutionName` — 관리할 기관 slug와 일치
2. `institutions/{institutionId}`:
   - `adminUserIds` 배열에 uid 추가
3. 앱에서 **My institution** → 프로필 사진/커버 편집 → **Manage institution**에서 랩·구성원 역할 관리

---

## 10. 프롬프트 대비 주요 델타 (의도적/현재)

| 주제 | 프롬프트 | 현재 구현 |
|------|----------|-----------|
| 공명 UI | Resonate, 웨이브 | **Like**, 하트; Firestore 필드명은 resonate 유지 |
| 비밀번호 | 8자+숫자 1 | 11자+, 대소문자+숫자+특수 |
| 회원가입 역할 | 4역할 선택 | 가입 시 `pending` → 온보딩에서 역할 |
| 일반 회원 | 없음 | `general` + 비학교 이메일 허용 |
| 이메일 인증 | 필수 | `requireEmailVerification: false` 기본 |
| Fan-out | Cloud Function | **클라이언트** `createPostAndFanOut` |
| Discovery | 점수·배지·검색 | 단순 쿼리 탭 |
| Messages | DM | **Coffee chat** 목록 |
| 기관 | institution_admin만 타입 | **전체 기관 프로필·미디어·관리 콘솔** |
| 메인 컬럼 | max-width 제한 | **사이드바 사이 전체 너비** |

---

## 11. 미구현 / 다음 작업 후보

- [ ] Cloud Functions: fan-out, resonate 리더보드, AI Brief 생성
- [ ] Stripe Checkout + webhook + `subscription` 동기화
- [ ] Resonate → Like UI 정합성 (또는 UI를 다시 Resonate로)
- [ ] Discovery: 트렌딩 점수, 순위 배지, 통합 검색
- [ ] Post 첨부 파일 Storage 업로드
- [ ] 실시간 DM / Messages 확장
- [ ] `React.lazy`, error boundary, 404, react-helmet-async
- [ ] Firebase Analytics 커스텀 이벤트
- [ ] 회원가입 플로우에서 `institution_admin` 자체 등록 (현재 수동/시드)

---

## 12. 구현 파일 빠른 색인 (기능 → 파일)

| 기능 | 핵심 파일 |
|------|-----------|
| 라우팅·가드 | `App.tsx`, `AuthGuard.tsx`, `OnboardedGuard.tsx` |
| 피드 | `FeedPage.tsx`, `useFeedItems.ts`, `PostCard.tsx`, `createPost.ts` |
| 댓글 스레드 | `PostCommentThread.tsx`, `postComments.ts` |
| 프로필 미디어 | `EditableProfileBanner.tsx`, `profileMedia.ts` |
| 랩/기관 미디어 | `EditableEntityBanner.tsx`, `entityMedia.ts` |
| 기관 관리 | `InstitutionAdminPage.tsx`, `institutions.ts`, `institutionAccess.ts` |
| 랩 탐색 | `LabExplorePage.tsx`, `labSearch.ts`, `InstitutionLabPicker.tsx` |
| 알림 | `NotificationBell.tsx`, `notify.ts`, `useNotifications.ts` |
| 팔로우 | `follow.ts` |
| 온보딩 완료 판정 | `onboardingGate.ts` |
| 규칙 | `firestore.rules`, `storage.rules` |

---

# PHASE SUMMARY

| Phase | Focus | Key Deliverables |
|---|---|---|
| **Phase 1** | Foundation | Project setup, Auth, Layout, Navigation |
| **Phase 2** | Core Features | Home Feed, Profiles, Research Graph |
| **Phase 3** | Social Layer | Lab System, Discovery Feed, Resonate |
| **Phase 4** | Engagement | Visitor Tracking, Coffee Chat, Jobs |
| **Phase 5** | Monetization | AI Brief, Stripe Payments, Deployment |

**→ 상세 구현 상태는 위 [개발 구현 현황 (Implementation Log)](#개발-구현-현황-implementation-log) 섹션 참고.**

---

*THE ERUDIS · theerudis.com · Share the Intelligence, Shape the World.*
