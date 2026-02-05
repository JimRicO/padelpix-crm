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

export type ClubTier = 'group_owned' | 'large' | 'multi_court' | 'boutique';

// Visual DNA Types
export interface PostingFrequencyDetail {
  posts_last_30_days?: number;
  posts_per_week_30d?: number;
  posts_last_90_days?: number;
  posts_per_week_90d?: number;
  posts_last_12_months?: number;
  posts_per_week_12mo?: number;
  trend?: 'accelerating' | 'steady' | 'declining' | 'dormant';
  last_post_days_ago?: number;
  longest_gap_days?: number;
}

export interface ScoreBreakdown {
  posting_frequency?: { weight: number; score: number; value?: string | number };
  content_quality?: { weight: number; score: number; value?: string };
  brand_consistency?: { weight: number; score: number; value?: string | number };
  engagement_rate?: { weight: number; score: number; value?: string | number };
  caption_effort?: { weight: number; score: number; value?: string };
}

export interface PhotographyStyle {
  primary_style?: string;
  secondary_style?: string;
  lighting?: string;
  saturation?: string;
  contrast?: string;
}

export interface Composition {
  primary_shot_type?: string;
  action_vs_lifestyle_ratio?: string;
  people_presence?: string;
  court_visibility?: string;
}

export interface BrandingElements {
  logo_visible?: boolean;
  logo_placement?: string;
  watermark?: boolean;
  text_overlays?: string;
  branded_templates?: boolean;
}

export interface ContentMix {
  action?: number;
  lifestyle?: number;
  events?: number;
  coaching?: number;
  facility?: number;
  community?: number;
  promotional?: number;
}

export interface VisualDnaData {
  dominant_colors?: string[];
  photography_style?: PhotographyStyle;
  composition?: Composition;
  branding_elements?: BrandingElements;
  content_mix?: ContentMix;
  score_breakdown?: ScoreBreakdown;
  posting_frequency_detail?: PostingFrequencyDetail;
  [key: string]: unknown;
}

export interface VoiceDnaData {
  tone?: string;
  energy_level?: string;
  caption_length_avg?: number;
  emoji_frequency?: string;
  top_emojis?: string[];
  hashtag_avg_count?: number;
  branded_hashtags?: string[];
  hashtag_placement?: string;
  cta_frequency?: string;
  cta_style?: string;
  languages_detected?: string[];
  recurring_themes?: string[];
  signature_phrases?: string[];
  [key: string]: unknown;
}

export interface CtltMatchData {
  top_matches?: Array<{ style: string; score: number }>;
  styles_to_avoid?: string[];
  enhancement_suggestion?: string;
  [key: string]: unknown;
}

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
  // New fields
  phone: string | null;
  business_description: string | null;
  google_maps_url: string | null;
  facebook: string | null;
  twitter: string | null;
  insta_url: string | null;
  insta_bio: string | null;
  insta_followers: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  avg_video_views: number | null;
  top_hashtags: string[] | null;
  key_individuals: string[] | null;
  key_people: Array<{ name?: string; role?: string; context?: string }> | null;
  // Enrichment fields
  enrichment_job_id: string | null;
  enrichment_status: string | null;
  enriched_at: string | null;
  // Brand identity fields
  color_palette: { primary?: string; secondary?: string; accent?: string; background?: string } | null;
  fonts: { primary?: string; heading?: string } | null;
  attitude: string | null;
  aesthetics: string | null;
  founder_info: string | null;
  founding_year: string | null;
  perplexity_description: string | null;
  perplexity_citations: string[] | null;
  recent_activities: Array<{ title?: string; date?: string; description?: string }> | null;
  instagram_profile_pic_url: string | null;
  // PadelPix integration fields
  pushed_to_padelpix_at: string | null;
  padelpix_club_profile_id: string | null;
  // Visual DNA fields
  visual_dna: VisualDnaData | null;
  voice_dna: VoiceDnaData | null;
  ctlt_matches: CtltMatchData | null;
  invisibility_score: number | null;
  invisibility_category: string | null;
  visual_dna_analyzed_at: string | null;
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

// Tier options for clubs - group_owned is for clubs with ownership groups
export const TIERS: ClubTier[] = ['group_owned', 'large', 'multi_court', 'boutique'];

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