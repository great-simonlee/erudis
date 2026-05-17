/**
 * Multi-user Firestore demo ecosystem (Admin SDK).
 *
 * Auth option A (no JSON key — use when org policy blocks key download):
 *   gcloud auth application-default login
 *   gcloud config set project erudis-47097
 *   unset GOOGLE_APPLICATION_CREDENTIALS
 *   npm run seed:firestore
 *
 * Auth option B (service account JSON file):
 *   export GOOGLE_APPLICATION_CREDENTIALS="$PWD/secrets/erudis-firebase-admin.json"
 *   npm run seed:firestore
 */

const { existsSync, readFileSync } = require('fs');
const { resolve } = require('path');

let admin;
try {
  admin = require('firebase-admin');
} catch (e) {
  if (e && typeof e === 'object' && 'code' in e && e.code === 'MODULE_NOT_FOUND') {
    console.error(`
Cannot find module "firebase-admin".

From the project root, install dependencies first:

  cd ${resolve(__dirname, '..')}
  npm install
  npm run seed:firestore
`);
    process.exit(1);
  }
  throw e;
}

const PROJECT_ID =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  'erudis-47097';
const {
  USERS,
  INSTITUTION_DOCS,
  LABS,
  POSTS,
  JOBS,
  PAPERS,
  RESEARCH_LOGS,
  RESEARCH_GRAPHS,
  COFFEE_CHATS,
} = require('./seedFirestoreDemoData.cjs');

function isInvalidGrantError(err) {
  const msg = err instanceof Error ? err.message : String(err);
  const details = err && typeof err === 'object' && 'details' in err ? String(err.details) : '';
  const combined = `${msg} ${details}`;
  return (
    combined.includes('invalid_grant') ||
    combined.includes('invalid_rapt') ||
    combined.includes('reauth related error')
  );
}

function explainCredentialsHelp(reason, { invalidGrant = false } = {}) {
  const reauthBlock = invalidGrant
    ? `
── Re-auth required (invalid_grant / invalid_rapt) ──
Your Google Application Default Credentials expired or need a fresh login
(common with Workspace accounts and advanced security).

  gcloud auth application-default revoke
  gcloud auth application-default login
  gcloud config set project ${PROJECT_ID}
  unset GOOGLE_APPLICATION_CREDENTIALS
  npm run seed:firestore

Complete the browser sign-in (including 2FA / re-auth if prompted).
If ADC still fails, use a service account JSON (Option B below).
`
    : '';

  console.error(`
${reason}
${reauthBlock}
── Option A: gcloud login (no service account JSON) ──
If your org blocks key creation (iam.disableServiceAccountKeyCreation), use this:

  gcloud auth application-default login
  gcloud config set project ${PROJECT_ID}
  unset GOOGLE_APPLICATION_CREDENTIALS
  npm run seed:firestore

You need Firestore write access on project ${PROJECT_ID} (e.g. Owner, Editor, or Firebase Admin).

── Option B: service account JSON file ──
Only if your org allows downloading keys:

  export GOOGLE_APPLICATION_CREDENTIALS="$PWD/secrets/erudis-firebase-admin.json"
  npm run seed:firestore
`);
}

function initFirebaseAdmin() {
  if (admin.apps.length) return;

  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    const resolved = resolve(keyPath);
    if (existsSync(resolved)) {
      const cred = JSON.parse(readFileSync(resolved, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(cred),
        projectId: cred.project_id || PROJECT_ID,
      });
      console.log(`Using service account key: ${resolved}`);
      return;
    }
    console.warn(`GOOGLE_APPLICATION_CREDENTIALS set but file missing: ${resolved}`);
    console.warn('Falling back to Application Default Credentials (gcloud login)…\n');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: PROJECT_ID,
    });
    console.log(`Using Application Default Credentials (project: ${PROJECT_ID})`);
  } catch (e) {
    explainCredentialsHelp(
      `Could not authenticate: ${e instanceof Error ? e.message : String(e)}`
    );
    process.exit(1);
  }
}

async function main() {
  initFirebaseAdmin();
  const db = admin.firestore();
  const now = admin.firestore.FieldValue.serverTimestamp();
  const baseMs = Date.now();

  let batch = db.batch();
  let ops = 0;

  const commitIfNeeded = async (force = false) => {
    if (force || ops >= 400) {
      if (ops > 0) await batch.commit();
      batch = db.batch();
      ops = 0;
    }
  };

  for (const u of USERS) {
    const { uid, ...rest } = u;
    batch.set(
      db.collection('users').doc(uid),
      {
        ...rest,
        isVerified: true,
        openToCollaborate: rest.openToCollaborate ?? true,
        collaborationTypes: rest.collaborationTypes ?? [],
        avatarUrl: rest.avatarUrl ?? '',
        websiteUrl: rest.websiteUrl ?? '',
        profileViews: rest.profileViews ?? 0,
        createdAt: now,
      },
      { merge: true }
    );
    ops++;
    await commitIfNeeded();
  }

  for (const inst of INSTITUTION_DOCS) {
    const { id, ...rest } = inst;
    batch.set(db.collection('institutions').doc(id), {
      ...rest,
      logoUrl: rest.logoUrl ?? '',
      coverUrl: rest.coverUrl ?? '',
      adminUserIds: rest.adminUserIds ?? [],
      createdAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const lab of LABS) {
    const { id, ...rest } = lab;
    batch.set(db.collection('labs').doc(id), {
      ...rest,
      logoUrl: rest.logoUrl ?? '',
      coverUrl: rest.coverUrl ?? '',
      requirePostApproval: rest.requirePostApproval ?? false,
      isLabPro: rest.isLabPro ?? false,
      websiteUrl: rest.websiteUrl ?? '',
      createdAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (let i = 0; i < POSTS.length; i++) {
    const spec = POSTS[i];
    const { id, hoursAgo, visibility, ...fields } = spec;
    const createdAt = admin.firestore.Timestamp.fromMillis(
      baseMs - (hoursAgo ?? i + 1) * 3_600_000
    );
    batch.set(db.collection('posts').doc(id), {
      ...fields,
      attachments: [],
      visibility: visibility ?? 'public',
      isPendingApproval: false,
      commentCount: 0,
      likeCount: fields.likeCount ?? 0,
      createdAt,
      updatedAt: createdAt,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const job of JOBS) {
    const { id, ...rest } = job;
    batch.set(db.collection('jobs').doc(id), {
      ...rest,
      active: true,
      sponsored: rest.sponsored ?? false,
      remote: rest.remote ?? false,
      createdAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const paper of PAPERS) {
    const { id, ...rest } = paper;
    batch.set(db.collection('papers').doc(id), {
      ...rest,
      doi: rest.doi ?? null,
      abstract: rest.abstract ?? 'Synthetic abstract for UI review only.',
      url: rest.url ?? null,
      arxivId: rest.arxivId ?? null,
      createdAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const log of RESEARCH_LOGS) {
    const ref = db.collection('research_logs').doc();
    batch.set(ref, {
      ...log,
      createdAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const graph of RESEARCH_GRAPHS) {
    batch.set(db.collection('research_graph').doc(graph.userId), {
      loggedDates: graph.loggedDates,
      currentStreak: graph.currentStreak,
      longestStreak: graph.longestStreak,
      totalLogDays: graph.totalLogDays,
      last30DayCount: graph.last30DayCount,
      updatedAt: now,
    });
    ops++;
    await commitIfNeeded();
  }

  for (const chat of COFFEE_CHATS) {
    const { id, hoursAgo, ...rest } = chat;
    const createdAt = admin.firestore.Timestamp.fromMillis(
      baseMs - (hoursAgo ?? 1) * 3_600_000
    );
    batch.set(db.collection('coffee_chats').doc(id), {
      ...rest,
      createdAt,
    });
    ops++;
    await commitIfNeeded();
  }

  await commitIfNeeded(true);

  const postsByAuthor = new Map();
  for (const p of POSTS) {
    if (!postsByAuthor.has(p.authorId)) postsByAuthor.set(p.authorId, []);
    postsByAuthor.get(p.authorId).push(p);
  }

  batch = db.batch();
  ops = 0;

  for (const u of USERS) {
    const following = u.following ?? [];
    for (const post of POSTS) {
      if (!following.includes(post.authorId)) continue;
      const vis = post.visibility ?? 'public';
      if (vis !== 'public') continue;
      const createdAt = admin.firestore.Timestamp.fromMillis(
        baseMs - (post.hoursAgo ?? 1) * 3_600_000
      );
      batch.set(db.collection('feed').doc(u.uid).collection('items').doc(post.id), {
        postId: post.id,
        authorId: post.authorId,
        createdAt,
      });
      ops++;
      if (ops >= 400) {
        await batch.commit();
        batch = db.batch();
        ops = 0;
      }
    }
  }

  if (ops > 0) await batch.commit();

  console.log('\nDemo ecosystem seeded.\n');
  console.log('Schools (institutions): MIT, Stanford, Berkeley, Cambridge, Harvard');
  console.log('  Institution admin demo: /profile/erudis_demo_inst_admin_mit');
  console.log('  MIT institution page: /institution/massachusetts-institute-of-technology');
  console.log('\nProfiles:');
  for (const u of USERS) {
    console.log(`  /profile/${u.uid}  — ${u.name} (${u.role})`);
  }
  console.log('\nLabs:');
  for (const lab of LABS) {
    console.log(`  /lab/${lab.id}  — ${lab.name}`);
  }
  console.log('\nJobs: open /jobs and search by institution or title.');
  console.log('Discover: public posts from demo authors.');
  console.log(
    '\nIn the app (with REACT_APP_ENABLE_DUMMY_SEED), use “Load sample data” on Home to follow these personas and fill your feed.'
  );
}

main().catch((e) => {
  if (isInvalidGrantError(e)) {
    explainCredentialsHelp(
      'Firestore seed failed: Google credentials need to be refreshed.',
      { invalidGrant: true }
    );
  } else {
    console.error(e);
  }
  process.exit(1);
});
