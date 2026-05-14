# THE ERUDIS — Web Development Prompts (5 Phases)
# Cursor AI용 단계별 개발 프롬프트

> **Stack:** React (TypeScript) · Firebase (Firestore, Auth, Storage, Functions) · Vercel
> **Repository:** https://github.com/great-simonlee/erudis
> **Domain:** theerudis.com
> **Brand Color:** #1D9E75

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

# PHASE SUMMARY

| Phase | Focus | Key Deliverables |
|---|---|---|
| **Phase 1** | Foundation | Project setup, Auth, Layout, Navigation |
| **Phase 2** | Core Features | Home Feed, Profiles, Research Graph |
| **Phase 3** | Social Layer | Lab System, Discovery Feed, Resonate |
| **Phase 4** | Engagement | Visitor Tracking, Coffee Chat, Jobs |
| **Phase 5** | Monetization | AI Brief, Stripe Payments, Deployment |

---

*THE ERUDIS · theerudis.com · Share the Intelligence, Shape the World.*
