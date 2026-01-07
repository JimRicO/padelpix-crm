import { useState } from 'react';
import { Club, PipelineStage } from '@/types/database';
import { ChevronDown, ChevronUp, Building2, MessageSquare, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EnterpriseGroupCardProps {
  groupName: string;
  clubs: Club[];
  totalCourts: number;
  totalDms: number;
  stageBreakdown: Record<string, number>;
  onClubClick: (club: Club) => void;
  currentStage: PipelineStage;
}

const STAGE_LABELS: Record<string, string> = {
  not_contacted: 'Not Contacted',
  followed: 'Followed',
  engaged: 'Engaged',
  dm_sent: 'DM Sent',
  responded: 'Responded',
  content_created: 'Content Created',
  trial: 'Trial',
  customer: 'Customer',
  dead: 'Dead',
};

export function EnterpriseGroupCard({
  groupName,
  clubs,
  totalCourts,
  totalDms,
  stageBreakdown,
  onClubClick,
  currentStage,
}: EnterpriseGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Only show clubs that match this column's stage
  const clubsInStage = clubs.filter(c => (c.pipeline_stage || 'not_contacted') === currentStage);
  
  if (clubsInStage.length === 0) return null;

  // Get summary of stages with clubs
  const stagesWithClubs = Object.entries(stageBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([stage, count]) => `${count} ${STAGE_LABELS[stage] || stage}`)
    .slice(0, 2);

  return (
    <div className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex flex-col gap-2 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-4 h-4 text-primary flex-shrink-0" />
              <h4 className="font-semibold text-sm text-foreground truncate">
                {groupName}
              </h4>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{clubs.length} clubs</span>
              {totalCourts > 0 && (
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  <span>{totalCourts}</span>
                </div>
              )}
              {totalDms > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{totalDms}</span>
                </div>
              )}
            </div>

            {!isExpanded && stagesWithClubs.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {stagesWithClubs.join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {clubsInStage.length} here
            </Badge>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Tier badge at bottom like other cards */}
        <div className="flex items-center gap-2 mt-1">
          <span className="tier-badge tier-group-owned">Group Owned</span>
        </div>
      </button>

      {/* Expanded club list */}
      {isExpanded && (
        <div className="border-t border-primary/10">
          {clubsInStage.map((club) => (
            <button
              key={club.id}
              onClick={(e) => {
                e.stopPropagation();
                onClubClick(club);
              }}
              className="w-full p-2 px-3 flex items-center gap-2 hover:bg-primary/5 transition-colors text-left border-b border-primary/5 last:border-b-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {club.club_name}
                </p>
                {club.city && (
                  <p className="text-xs text-muted-foreground truncate">
                    {club.city}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
