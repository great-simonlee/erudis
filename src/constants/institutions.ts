export type InstitutionRecord = { readonly id: string; readonly name: string };

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Major universities & institutes for onboarding autocomplete (expand over time). */
const INSTITUTION_NAMES: readonly string[] = [
  'Aalto University',
  'Aarhus University',
  'Australian National University',
  'Boston University',
  'Brown University',
  'California Institute of Technology',
  'Carnegie Mellon University',
  'Chinese University of Hong Kong',
  'Columbia University',
  'Cornell University',
  'Delft University of Technology',
  'Duke University',
  'École Polytechnique Fédérale de Lausanne',
  'ETH Zurich',
  'Fudan University',
  'Georgia Institute of Technology',
  'Harvard University',
  'Hebrew University of Jerusalem',
  'Hong Kong University of Science and Technology',
  'Imperial College London',
  'Indiana University Bloomington',
  'Johns Hopkins University',
  'Karolinska Institute',
  'King Abdulaziz University',
  'King\'s College London',
  'Korea Advanced Institute of Science and Technology',
  'Kyoto University',
  'Leiden University',
  'London School of Economics and Political Science',
  'Ludwig Maximilian University of Munich',
  'Massachusetts Institute of Technology',
  'McGill University',
  'Monash University',
  'National University of Singapore',
  'New York University',
  'Northwestern University',
  'Ohio State University',
  'Osaka University',
  'Peking University',
  'Pennsylvania State University',
  'Pohang University of Science and Technology',
  'Pompeu Fabra University',
  'Princeton University',
  'Purdue University',
  'Rice University',
  'Seoul National University',
  'Shanghai Jiao Tong University',
  'Stanford University',
  'Technical University of Munich',
  'Tel Aviv University',
  'Texas A&M University',
  'Tohoku University',
  'Tokyo Institute of Technology',
  'Tsinghua University',
  'Tufts University',
  'University College London',
  'University of Amsterdam',
  'University of Auckland',
  'University of Barcelona',
  'University of British Columbia',
  'University of California, Berkeley',
  'University of California, Davis',
  'University of California, Irvine',
  'University of California, Los Angeles',
  'University of California, San Diego',
  'University of California, Santa Barbara',
  'University of Cambridge',
  'University of Chicago',
  'University of Copenhagen',
  'University of Edinburgh',
  'University of Florida',
  'University of Göttingen',
  'University of Hong Kong',
  'University of Illinois Urbana-Champaign',
  'University of Manchester',
  'University of Maryland, College Park',
  'University of Melbourne',
  'University of Michigan',
  'University of Minnesota',
  'University of North Carolina at Chapel Hill',
  'University of Oxford',
  'University of Pennsylvania',
  'University of Pittsburgh',
  'University of Queensland',
  'University of Science and Technology of China',
  'University of Sydney',
  'University of Texas at Austin',
  'University of Tokyo',
  'University of Toronto',
  'University of Washington',
  'University of Wisconsin-Madison',
  'University of Zurich',
  'Utrecht University',
  'Vanderbilt University',
  'Washington University in St. Louis',
  'Wageningen University & Research',
  'Weizmann Institute of Science',
  'Yale University',
  'Yonsei University',
  'Zhejiang University',
];

export const INSTITUTION_CATALOG: readonly InstitutionRecord[] = Array.from(
  new Map(
    INSTITUTION_NAMES.map((name) => [slugify(name), { id: slugify(name), name }])
  ).values()
).sort((a, b) => a.name.localeCompare(b.name));

export function filterInstitutions(
  query: string,
  catalog: readonly InstitutionRecord[]
): InstitutionRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...catalog];
  return catalog
    .filter((row) => row.name.toLowerCase().includes(q))
    .sort((a, b) => {
      const al = a.name.toLowerCase();
      const bl = b.name.toLowerCase();
      const as = al.startsWith(q) ? 0 : 1;
      const bs = bl.startsWith(q) ? 0 : 1;
      if (as !== bs) return as - bs;
      return a.name.localeCompare(b.name);
    });
}
