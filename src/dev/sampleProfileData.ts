import type { ProfileEducation, ProfileWorkExperience } from '../types';

/** Sample research logs written to `research_logs` (see seedPlatformReviewData). */
export const SAMPLE_RESEARCH_LOGS = [
  {
    date: '2026-01-08',
    type: 'experiment' as const,
    title: 'Pilot run: instrument calibration checklist',
    content:
      'Documented baseline noise floor after recalibration. Sharing notes for the lab wiki so the next rotation does not repeat the same drift issues we saw in December.',
    isPublic: true,
    tags: ['methods', 'lab'],
  },
  {
    date: '2026-01-12',
    type: 'idea' as const,
    title: 'Cross-lab replication swap',
    content:
      'Proposal: exchange one figure worth of experiments with a partner lab next month. Could standardize how we report hardware profiles alongside benchmark numbers.',
    isPublic: true,
    tags: ['collaboration'],
  },
  {
    date: '2026-01-15',
    type: 'paper_review' as const,
    title: 'Reading group — causal discovery survey',
    content:
      'Skimmed three survey papers from 2022–2024. Flagged gaps on mixed continuous/categorical data for our journal club summary next week.',
    isPublic: true,
    tags: ['reading', 'causality'],
  },
  {
    date: '2026-01-18',
    type: 'writing' as const,
    title: 'Methods section — reviewer round 1',
    content:
      'Tightened statistical reporting per committee feedback. Keeping a private draft until the PI signs off on the figure set.',
    isPublic: false,
    tags: ['thesis'],
  },
  {
    date: '2026-01-22',
    type: 'result' as const,
    title: 'Ablation: learning rate vs. batch size',
    content:
      'Smaller batches helped stability on our noisy validation split. Uploaded configs to the shared drive with seed notes for reproducibility.',
    isPublic: true,
    tags: ['ml', 'benchmarks'],
  },
];

export const SAMPLE_EDUCATIONS: ProfileEducation[] = [
  {
    id: 'sample-edu-peking',
    school: 'Peking University',
    degree: 'B.B.A.',
    field: 'Marketing',
    startYear: 2009,
    endYear: 2016,
    ongoing: false,
    description: 'I studied marketing',
  },
  {
    id: 'sample-edu-neu',
    school: 'Northeastern University',
    degree: 'M.S.',
    field: 'Computer Science',
    startYear: 2018,
    endYear: 2022,
    ongoing: false,
    description: 'Thesis on reproducible ML pipelines for small research teams.',
  },
];

export const SAMPLE_WORK_EXPERIENCES: ProfileWorkExperience[] = [
  {
    id: 'sample-work-ra',
    title: 'Research Assistant',
    organization: 'Rivera Lab',
    location: 'Boston, MA',
    startYear: 2020,
    endYear: 2022,
    ongoing: false,
    description: 'Experiment design, benchmark harnesses, and lab wiki documentation.',
  },
  {
    id: 'sample-work-scientist',
    title: 'Research Scientist',
    organization: 'Demo Research Co.',
    location: 'Remote',
    startYear: 2022,
    endYear: null,
    ongoing: true,
    description: 'Applied ML for scientific discovery tools and internal research platforms.',
  },
];
