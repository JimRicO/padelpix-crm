import { useState } from 'react';
import { Club, PipelineStage } from '@/types/database';
import { ChevronDown, ChevronUp, Building2, MessageSquare, Crown, Settings, Check, MapPin } from 'lucide-react';
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
  onGroupClick?: (groupName: string) => void;
  totalClubsOverride?: number | null;
  isCompact?: boolean;
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
  onGroupClick,
  totalClubsOverride,
  isCompact = false,
}: EnterpriseGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onGroupClick?.(groupName);
  };

  // Only show clubs that match this column's stage
  const clubsInStage = clubs.filter(c => (c.pipeline_stage || 'not_contacted') === currentStage);
  
  if (clubsInStage.length === 0) return null;

  // Get summary of stages with clubs
  const stagesWithClubs = Object.entries(stageBreakdown)
    .filter(([_, count]) => count > 0)
    .map(([stage, count]) => `${count} ${STAGE_LABELS[stage] || stage}`)
    .slice(0, 2);

  // Compact view for non-first columns
  if (isCompact) {
    return (
      <div 
        onClick={() => onGroupClick?.(groupName)}
        className="card-compact bg-primary/5 border border-primary/20 hover:bg-primary/10"
      >
        <div className="w-3.5 h-3.5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-2.5 h-2.5 text-success" />
        </div>
        <Crown className="card-icon-sm text-primary" />
        <span className="card-title flex-1">{groupName}</span>
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary px-1.5 py-0">
          {clubsInStage.length}
        </Badge>
      </div>
    );
  }

  return (
    <div className="card-standard bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-0 overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2.5 flex flex-col gap-1.5 hover:bg-primary/5 transition-colors text-left"
      >
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="flex-1 min-w-0">
            <button
              onClick={handleHeaderClick}
              className="flex items-center gap-1.5 mb-1 hover:text-primary transition-colors group"
            >
              <Crown className="card-icon-sm text-primary" />
              <h4 className="card-title group-hover:text-primary">
                {groupName}
              </h4>
              <Settings className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="card-meta-row mb-0">
              <span>
                {totalClubsOverride 
                  ? `${clubs.length} of ${totalClubsOverride} clubs`
                  : `${clubs.length} clubs`}
              </span>
              {totalCourts > 0 && (
                <div className="card-meta">
                  <Building2 className="card-icon-sm" />
                  <span>{totalCourts}</span>
                </div>
              )}
              {totalDms > 0 && (
                <div className="card-meta">
                  <MessageSquare className="card-icon-sm" />
                  <span>{totalDms}</span>
                </div>
              )}
              <div className="card-meta">
                <MapPin className="card-icon-sm" />
                <span>South Africa</span>
              </div>
            </div>

            {!isExpanded && stagesWithClubs.length > 0 && (
              <p className="card-subtitle truncate mt-0.5">
                {stagesWithClubs.join(', ')}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary px-1.5 py-0">
              {clubsInStage.length} here
            </Badge>
            {isExpanded ? (
              <ChevronUp className="card-icon-sm text-muted-foreground" />
            ) : (
              <ChevronDown className="card-icon-sm text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Tier badge at bottom like other cards */}
        <div className="flex items-center gap-2 mt-0.5">
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
              className="w-full py-1.5 px-2.5 flex items-center gap-2 hover:bg-primary/5 transition-colors text-left border-b border-primary/5 last:border-b-0"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {club.club_name}
                </p>
                {club.city && (
                  <p className="card-subtitle truncate">
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
