import { extraInstitutionalEmailDomains } from '../config/flags';

/**
 * Institutional email heuristics for THE ERUDIS.
 * Covers common academic TLDs and second-level academic domains.
 */
const ACADEMIC_SUFFIXES: readonly string[] = [
  '.edu',
  '.edu.au',
  '.edu.cn',
  '.ac.kr',
  '.ac.uk',
  '.ac.jp',
  '.ac.nz',
  '.ac.za',
  '.ac.in',
  '.ac.id',
  '.ac.th',
  '.ac.sg',
  '.ac.ae',
  '.ac.il',
  '.ac.ir',
  '.ac.cn',
  '.ac.hk',
  '.ac.tw',
  '.edu.hk',
  '.edu.tw',
  '.edu.sg',
  '.edu.my',
  '.edu.ph',
];

const ACADEMIC_SECOND_LEVEL = new Set<string>([
  'ac.uk',
  'ac.jp',
  'ac.kr',
  'edu.au',
  'edu.cn',
  'edu.sg',
  'edu.hk',
  'edu.tw',
  'edu.my',
  'edu.ph',
  'ac.nz',
  'ac.za',
  'ac.in',
  'ac.id',
  'ac.th',
  'ac.sg',
  'ac.ae',
  'ac.il',
  'ac.ir',
  'ac.cn',
  'ac.hk',
  'ac.tw',
]);

function domainFromEmail(email: string): string | null {
  const at = email.lastIndexOf('@');
  if (at === -1 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

function domainOnExtraAllowlist(domain: string): boolean {
  for (const d of extraInstitutionalEmailDomains) {
    const dLower = d.toLowerCase();
    if (domain === dLower || domain.endsWith(`.${dLower}`)) return true;
  }
  return false;
}

export function isAcademicEmail(email: string): boolean {
  const domain = domainFromEmail(email);
  if (!domain) return false;

  if (domainOnExtraAllowlist(domain)) return true;

  for (const suffix of ACADEMIC_SUFFIXES) {
    if (domain.endsWith(suffix)) return true;
  }

  const parts = domain.split('.');
  if (parts.length >= 2) {
    const sld = `${parts[parts.length - 2]}.${parts[parts.length - 1]}`;
    if (ACADEMIC_SECOND_LEVEL.has(sld)) return true;
  }

  // e.g. university.ac.uk subdomains
  if (domain.endsWith('.ac.uk') || domain.endsWith('.ac.jp') || domain.endsWith('.ac.kr')) {
    return true;
  }

  return false;
}
