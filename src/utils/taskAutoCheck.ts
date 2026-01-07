import { Club } from '@/types/database';

// Pipeline stage order for comparison
const STAGE_ORDER = [
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

function isStageAtOrAfter(currentStage: string | null | undefined, targetStage: string): boolean {
  if (!currentStage) return false;
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const targetIndex = STAGE_ORDER.indexOf(targetStage);
  return currentIndex >= targetIndex && currentIndex !== -1 && targetIndex !== -1;
}

export interface TaskAutoStatus {
  isAutoComplete: boolean;
  missingFields?: string[];
  completedFields?: string[];
}

// Required fields for database collection
const DATABASE_FIELDS = [
  { key: 'instagram_handle', label: 'Instagram' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'city', label: 'City' },
  { key: 'contact_name', label: 'Contact Name' },
] as const;

export function getTaskAutoStatus(taskTitle: string, club: Club): TaskAutoStatus {
  const normalizedTitle = taskTitle.toLowerCase().trim();

  // Database collection - check required fields
  if (normalizedTitle === 'database collection') {
    const missingFields: string[] = [];
    const completedFields: string[] = [];
    
    DATABASE_FIELDS.forEach(field => {
      const value = club[field.key as keyof Club];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(field.label);
      } else {
        completedFields.push(field.label);
      }
    });

    return {
      isAutoComplete: missingFields.length === 0,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      completedFields: completedFields.length > 0 ? completedFields : undefined,
    };
  }

  // Logo collection - check if logo exists
  if (normalizedTitle === 'logo collection') {
    const hasLogo = !!club.logo && club.logo.trim() !== '';
    return {
      isAutoComplete: hasLogo,
      missingFields: hasLogo ? undefined : ['Logo not uploaded'],
    };
  }

  // Following - check followed_date or pipeline stage
  if (normalizedTitle === 'following') {
    const isComplete = !!club.followed_date || isStageAtOrAfter(club.pipeline_stage, 'followed');
    return {
      isAutoComplete: isComplete,
      missingFields: isComplete ? undefined : ['Club not followed yet'],
    };
  }

  // Engaging - check first_comment_date or pipeline stage
  if (normalizedTitle === 'engaging') {
    const isComplete = !!club.first_comment_date || isStageAtOrAfter(club.pipeline_stage, 'engaged');
    return {
      isAutoComplete: isComplete,
      missingFields: isComplete ? undefined : ['No engagement recorded'],
    };
  }

  // Content creation - check content pieces or content_created_date
  if (normalizedTitle === 'content creation') {
    const isComplete = 
      (club.total_content_pieces && club.total_content_pieces > 0) || 
      !!club.content_created_date ||
      isStageAtOrAfter(club.pipeline_stage, 'content_created');
    return {
      isAutoComplete: isComplete,
      missingFields: isComplete ? undefined : ['No content created yet'],
    };
  }

  // DM - check first_dm_date or pipeline stage
  if (normalizedTitle === 'dm') {
    const isComplete = !!club.first_dm_date || isStageAtOrAfter(club.pipeline_stage, 'dm_sent');
    return {
      isAutoComplete: isComplete,
      missingFields: isComplete ? undefined : ['DM not sent yet'],
    };
  }

  // Non-default task - no auto-check
  return { isAutoComplete: false };
}

// Get summary of all default tasks completion
export function getTasksSummary(tasks: Array<{ title: string; status?: string | null }>, club: Club) {
  let autoCompleteCount = 0;
  let manualCompleteCount = 0;
  
  tasks.forEach(task => {
    const autoStatus = getTaskAutoStatus(task.title, club);
    if (autoStatus.isAutoComplete || task.status === 'completed') {
      if (autoStatus.isAutoComplete) {
        autoCompleteCount++;
      } else {
        manualCompleteCount++;
      }
    }
  });

  return {
    total: tasks.length,
    completed: autoCompleteCount + manualCompleteCount,
    autoComplete: autoCompleteCount,
    manualComplete: manualCompleteCount,
  };
}
