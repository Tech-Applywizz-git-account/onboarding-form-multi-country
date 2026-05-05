// src/pages/Onboarding/universityData.ts
// Real universities dynamically extracted from the curated dataset

import usUniversities from './us_universities.json';
import ukUniversities from './uk_universities.json';
import canadaUniversities from './canada_universities.json';
import irelandUniversities from './ireland_universities.json';

export const UNIVERSITY_DATA: Record<string, string[]> = {
  "United States": usUniversities as string[],
  "United Kingdom": ukUniversities as string[],
  "Canada": canadaUniversities as string[],
  "Ireland": irelandUniversities as string[],
};

// Flatten all for global fallback
export const ALL_UNIVERSITIES: string[] = [
  ...new Set(Object.values(UNIVERSITY_DATA).flat())
];

/**
 * Fast local university search — starts-with ranked first, then contains.
 */
export function searchUniversitiesLocally(query: string, country?: string): string[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().trim();

  const pool: string[] =
    country && UNIVERSITY_DATA[country]
      ? UNIVERSITY_DATA[country]
      : ALL_UNIVERSITIES;

  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const u of pool) {
    const lower = u.toLowerCase();
    if (lower.startsWith(q)) startsWith.push(u);
    else if (lower.includes(q)) contains.push(u);
    if (startsWith.length + contains.length >= 20) break;
  }

  return [...startsWith, ...contains].slice(0, 15);
}
