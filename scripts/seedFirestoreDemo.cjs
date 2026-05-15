/**
 * Optional multi-user Firestore seed (Admin SDK, CommonJS).
 *
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
 *   npm run seed:firestore
 */

const { readFileSync } = require('fs');
const admin = require('firebase-admin');

async function main() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON path.');
    process.exit(1);
  }

  const cred = JSON.parse(readFileSync(keyPath, 'utf8'));
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(cred) });
  }
  const db = admin.firestore();

  const UIDS = ['erudis_seed_alpha', 'erudis_seed_beta', 'erudis_seed_gamma'];
  const now = admin.firestore.FieldValue.serverTimestamp();

  const users = [
    {
      uid: UIDS[0],
      name: 'Dr. Alex Rivera',
      email: 'alex.rivera.seed@example.edu',
      role: 'professor',
      institutionId: 'custom:demo-university',
      institutionName: 'Demo University',
      labOnboardingIntent: 'defer',
      labIds: [],
      primaryLabId: null,
      researchAreas: ['Computer Science', 'AI/ML'],
      following: [UIDS[1], UIDS[2]],
      followers: [UIDS[1]],
      isVerified: true,
      openToCollaborate: true,
      collaborationTypes: [],
      openToWork: ['faculty_positions', 'postdoc_positions'],
      subscription: 'pro',
      bio: 'Demo PI profile for staging review.',
      avatarUrl: '',
      websiteUrl: '',
      profileViews: 0,
      createdAt: now,
    },
    {
      uid: UIDS[1],
      name: 'Jordan Kim',
      email: 'jordan.kim.seed@example.edu',
      role: 'phd',
      institutionId: 'custom:demo-university',
      institutionName: 'Demo University',
      labOnboardingIntent: 'join_lab',
      labIds: [],
      primaryLabId: null,
      researchAreas: ['Neuroscience'],
      following: [UIDS[0]],
      followers: [UIDS[0], UIDS[2]],
      isVerified: true,
      openToCollaborate: true,
      collaborationTypes: [],
      openToWork: ['postdoc_positions', 'industry'],
      subscription: 'free',
      bio: 'Demo PhD student profile.',
      avatarUrl: '',
      websiteUrl: '',
      profileViews: 0,
      createdAt: now,
    },
    {
      uid: UIDS[2],
      name: 'Sam Okonkwo',
      email: 'sam.okonkwo.seed@example.edu',
      role: 'institution_admin',
      institutionId: 'custom:demo-university',
      institutionName: 'Demo University HR',
      labOnboardingIntent: 'defer',
      labIds: [],
      primaryLabId: null,
      researchAreas: ['Economics'],
      following: [UIDS[0]],
      followers: [],
      isVerified: true,
      openToCollaborate: false,
      collaborationTypes: [],
      openToWork: ['nothing_now'],
      subscription: 'free',
      bio: 'Demo institution HR viewer.',
      avatarUrl: '',
      websiteUrl: '',
      profileViews: 0,
      createdAt: now,
    },
  ];

  const batch = db.batch();
  for (const u of users) {
    const { uid, ...rest } = u;
    batch.set(db.collection('users').doc(uid), rest, { merge: true });
  }

  const labRef = db.collection('labs').doc('erudis_seed_lab');
  batch.set(labRef, {
    name: 'Demo Adaptive Systems Lab',
    institutionId: 'custom:demo-university',
    institutionName: 'Demo University',
    department: 'Computer Science',
    piId: UIDS[0],
    memberIds: [UIDS[0], UIDS[1]],
    researchAreas: ['AI/ML', 'Computer Science'],
    description: 'Synthetic lab for UI review — collaboration and hiring demos.',
    logoUrl: '',
    requirePostApproval: false,
    isLabPro: false,
    followers: [],
    createdAt: now,
  });

  await batch.commit();

  await db.collection('users').doc(UIDS[0]).update({
    labIds: ['erudis_seed_lab'],
    primaryLabId: 'erudis_seed_lab',
  });
  await db.collection('users').doc(UIDS[1]).update({
    labIds: ['erudis_seed_lab'],
    primaryLabId: 'erudis_seed_lab',
  });

  console.log('Seed user profile paths (open in app while logged in):');
  for (const id of UIDS) {
    console.log(`  /profile/${id}`);
  }
  console.log('Lab: /lab/erudis_seed_lab');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
