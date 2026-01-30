export interface Person {
  id: string;
  full_name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  instagram_handle: string | null;
  linkedin: string | null;
  notes: string | null;
  profile_image: string | null;
  contact_date: string | null;
  contact_method: string | null;
  contact_method_other: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PersonLink {
  id: string;
  person_id: string;
  link_type: 'club' | 'ownership_group';
  club_id: string | null;
  ownership_group_name: string | null;
  role_at_entity: string | null;
  is_primary: boolean;
  created_at: string;
  created_by: string | null;
}

export interface PersonLinkSuggestion {
  id: string;
  person_id: string;
  link_type: 'club' | 'ownership_group';
  club_id: string | null;
  ownership_group_name: string | null;
  match_reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const CONTACT_METHODS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'in_person', label: 'In Person' },
  { value: 'other', label: 'Other' },
] as const;

export type ContactMethod = typeof CONTACT_METHODS[number]['value'];

export interface EnrichedPerson {
  id: string;
  job_id?: string;
  people_row_id?: string;
  person_name: string;
  context?: string | null;
  aliases?: string[];

  // Photo
  photo_url: string | null;

  // Current Role
  job_title: string | null;
  company: string | null;
  department: string | null;
  location: string | null;
  start_date?: string | null;
  reports_to?: string | null;
  role_source?: string | null;

  // Biography
  biography: string | null;
  biography_source: string | null;

  // Career History
  previous_roles: Array<{ title: string; company: string; years?: string }>;
  career_highlights?: string[];

  // Education
  education: Array<{ degree: string; institution: string; year?: string; field?: string }>;

  // Achievements
  notable_achievements?: string | null;
  achievements_source?: string | null;

  // Contact Information
  email: string | null;
  email_confidence: string | null;
  email_pattern?: string | null;
  email_source?: string | null;
  phone: string | null;
  phone_source?: string | null;

  // Social Profiles
  linkedin_url: string | null;
  twitter_handle: string | null;
  website: string | null;
  other_socials?: Record<string, string>;
  notable_content?: Array<{ title?: string; url?: string }> | string[];

  // Recent News
  recent_news: Array<{ headline: string; source: string; date: string; url: string }>;

  // Sales Insights
  communication_style: string | null;
  key_interests: string[];
  conversation_starters: string[];
  quotes: string[];

  // Research Quality
  all_citations: string[];
  confidence_score: 'high' | 'medium' | 'low' | null;
  research_summary: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}
