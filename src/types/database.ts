export type PipelineStage = 
  | 'not_contacted' 
  | 'followed' 
  | 'engaged' 
  | 'dm_sent' 
  | 'responded' 
  | 'content_created' 
  | 'trial' 
  | 'customer' 
  | 'dead';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type ClubTier = 'enterprise' | 'multi_court' | 'boutique';

export interface Club {
  id: string;
  club_name: string;
  instagram_handle: string | null;
  linkedin: string | null;
  logo: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
  whatsapp: string | null;
  email: string | null;
  number_of_courts: number | null;
  address: string | null;
  pipeline_stage: PipelineStage;
  followed_date: string | null;
  first_comment_date: string | null;
  first_dm_date: string | null;
  first_response_date: string | null;
  content_created_date: string | null;
  trial_start_date: string | null;
  converted_date: string | null;
  total_comments: number;
  total_dms: number;
  total_content_pieces: number;
  response_time_hours: number | null;
  notes: string | null;
  contact_name: string | null;
  next_action: string | null;
  next_action_date: string | null;
  tier: ClubTier | null;
  priority: PriorityLevel;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  suburb: string | null;
  coaches: string[] | null;
  ownership_group: string | null;
}

export interface Activity {
  id: string;
  club_id: string;
  activity_type: string;
  activity_date: string;
  title: string;
  description: string | null;
  link: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  created_by: string | null;
}

export interface ContentPiece {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  style: string | null;
  dimensions: string | null;
  created_date: string;
  sent_date: string | null;
  club_response: string | null;
  status: string;
  created_at: string;
  created_by: string | null;
}

export interface DmTemplate {
  id: string;
  template_name: string;
  template_type: string | null;
  template_body: string;
  variables: string[] | null;
  use_count: number;
  last_used: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Task {
  id: string;
  club_id: string;
  title: string;
  description: string | null;
  task_type: string | null;
  priority: PriorityLevel;
  status: string;
  due_date: string | null;
  completed_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  'not_contacted',
  'followed',
  'engaged',
  'dm_sent',
  'responded',
  'content_created',
  'trial',
  'customer',
  'dead',
];

export const TIERS: ClubTier[] = ['enterprise', 'multi_court', 'boutique'];

export const PRIORITIES: PriorityLevel[] = ['high', 'medium', 'low'];

export const ACTIVITY_TYPES = [
  'followed',
  'comment',
  'dm_sent',
  'dm_received',
  'content_created',
  'note_added',
  'stage_changed',
  'call_scheduled',
  'trial_started',
  'converted',
  'content_shared',
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];