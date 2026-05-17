/**
 * Profile career + public research logs for demo personas (Admin seed).
 * Source of truth: src/dev/demoProfileCareerData.json
 */

const careerByUid = require('../src/dev/demoProfileCareerData.json');

const DEMO_PROFILE_CAREER_BY_UID = Object.fromEntries(
  Object.entries(careerByUid).map(([uid, entry]) => [
    uid,
    {
      educations: entry.educations ?? [],
      workExperiences: entry.workExperiences ?? [],
    },
  ])
);

const DEMO_EXTRA_RESEARCH_LOGS = Object.entries(careerByUid).flatMap(([uid, entry]) =>
  (entry.researchLogs ?? []).map((log) => ({ ...log, userId: uid }))
);

module.exports = {
  DEMO_PROFILE_CAREER_BY_UID,
  DEMO_EXTRA_RESEARCH_LOGS,
};
