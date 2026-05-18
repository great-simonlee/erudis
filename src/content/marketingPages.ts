export type MarketingPageSlug =
  | 'about'
  | 'news'
  | 'schools-institutions'
  | 'services'
  | 'career'
  | 'roadmap'
  | 'contact';

export type MarketingPageContent = {
  title: string;
  intro: string;
  paragraphs: string[];
};

export const MARKETING_PAGES: Record<MarketingPageSlug, MarketingPageContent> = {
  about: {
    title: 'About THE ERUDIS',
    intro: 'Share the Intelligence, Shape the World.',
    paragraphs: [
      'THE ERUDIS is a verified academic network where researchers share papers, studies, and research experiences across disciplines—so ideas travel beyond departmental walls.',
      'We built Erudis for students, postdocs, faculty, and lab staff who want their own work seen and who stay curious about how other fields think.',
    ],
  },
  news: {
    title: 'News',
    intro: 'Updates from THE ERUDIS team.',
    paragraphs: [
      'Product launches, research-community highlights, and platform notes will appear here as we grow.',
      'For press or partnership inquiries, visit Contact.',
    ],
  },
  'schools-institutions': {
    title: 'Schools & Institutions',
    intro: 'Verified homes for universities and their labs on Erudis.',
    paragraphs: [
      'Institution pages give schools a trusted presence—linking departments, labs, and researchers under one academic identity.',
      'Lab pages showcase research areas, memberships, papers, and opportunities so visitors know who does the work and where.',
      'Sign in with your institutional email to join your school or request admin access for your institution.',
    ],
  },
  services: {
    title: 'Services',
    intro: 'How THE ERUDIS supports the research lifecycle.',
    paragraphs: [
      'Cross-field discovery: explore papers, posts, and research logs from disciplines outside your own.',
      'Research ritual: daily logs and lab-note stories that make steady progress visible.',
      'Collaboration: verified profiles, messaging, coffee chats, and lab membership.',
      'Hiring: job posts tied to real labs and institutions.',
    ],
  },
  career: {
    title: 'Career',
    intro: 'Build with us.',
    paragraphs: [
      'We are growing THE ERUDIS to help researchers share intelligence and shape the world together.',
      'Open roles and internship opportunities will be listed here. For general interest, reach out via Contact.',
    ],
  },
  roadmap: {
    title: 'Roadmap',
    intro: 'Where THE ERUDIS is headed.',
    paragraphs: [
      'Near term: richer paper discovery, institution admin tools, and improved cross-field feeds.',
      'Next: deeper lab analytics, collaboration workflows, and integrations with academic identity providers.',
      'We ship in conversation with researchers—your feedback after sign-in shapes priorities.',
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'We would like to hear from you.',
    paragraphs: [
      'For product feedback, partnerships, or institution onboarding, email info@theerudis.com.',
      'Researchers with institutional emails can create an account and explore the platform immediately.',
    ],
  },
};

export const LANDING_FOOTER_LINKS: { label: string; path: string }[] = [
  { label: 'About', path: '/about' },
  { label: 'News', path: '/news' },
  { label: 'Schools & Institutions', path: '/schools-institutions' },
  { label: 'Services', path: '/services' },
  { label: 'Career', path: '/career' },
  { label: 'Roadmap', path: '/roadmap' },
  { label: 'Contact', path: '/contact' },
];
