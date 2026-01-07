import { Club } from '@/types/database';

// Define known ownership patterns
export const OWNERSHIP_PATTERNS = [
  // Existing patterns
  { pattern: /virgin/i, group: 'Virgin Active' },
  { pattern: /africa\s*padel/i, group: 'Africa Padel' },
  { pattern: /balwin/i, group: 'Balwin' },
  { pattern: /proactive/i, group: 'Proactive Padel' },
  
  // New patterns
  { pattern: /ten\s*by\s*twenty|10\s*by\s*20|10x20/i, group: 'Ten By Twenty' },
  { pattern: /techno\s*padel/i, group: 'Techno Padel' },
  { pattern: /club\s*padel/i, group: 'Club Padel' },
  { pattern: /padel\s*nation/i, group: 'Padel Nation' },
  { pattern: /propadel|pro\s*padel/i, group: 'ProPadel' },
  { pattern: /gayle\s*padel/i, group: 'Gayle Padel' },
  { pattern: /liv\s*padel|livpadel/i, group: 'Liv Padel' },
  { pattern: /net\s*set/i, group: 'Net Set Padel' },
  { pattern: /padel\s*&\s*social/i, group: 'Padel & Social Club' },
  { pattern: /padel\s*lab/i, group: 'Padel Lab' },
];

export function detectOwnershipGroup(clubName: string): string | null {
  for (const { pattern, group } of OWNERSHIP_PATTERNS) {
    if (pattern.test(clubName)) return group;
  }
  return null;
}

export function shouldHaveOwnershipGroup(clubName: string, currentOwnership: string | null | undefined): {
  detected: string | null;
  isMissing: boolean;
} {
  const detected = detectOwnershipGroup(clubName);
  const isMissing = detected !== null && (!currentOwnership || currentOwnership.trim() === '');
  return { detected, isMissing };
}

export interface OwnershipGroup {
  name: string;
  clubs: Club[];
  totalCourts: number;
  totalDms: number;
  stageBreakdown: Record<string, number>;
}

export function groupClubsByOwnership(clubs: Club[]): {
  groups: OwnershipGroup[];
  ungrouped: Club[];
} {
  const groupMap = new Map<string, Club[]>();
  const ungrouped: Club[] = [];

  clubs.forEach(club => {
    if (club.ownership_group && club.ownership_group.trim()) {
      const existing = groupMap.get(club.ownership_group) || [];
      groupMap.set(club.ownership_group, [...existing, club]);
    } else {
      ungrouped.push(club);
    }
  });

  const groups: OwnershipGroup[] = Array.from(groupMap.entries()).map(([name, groupClubs]) => ({
    name,
    clubs: groupClubs,
    totalCourts: groupClubs.reduce((sum, c) => sum + (c.number_of_courts || 0), 0),
    totalDms: groupClubs.reduce((sum, c) => sum + (c.total_dms || 0), 0),
    stageBreakdown: groupClubs.reduce((acc, c) => {
      const stage = c.pipeline_stage || 'not_contacted';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }));

  return { groups, ungrouped };
}
