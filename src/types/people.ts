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
