import { Club } from '@/types/database';
import { Instagram, MapPin, Building2, MessageSquare, Users, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIER_LABELS: Record<string, string> = {
  group_owned: 'Group Owned',
  large: 'Large',
  multi_court: 'Multi Court',
  boutique: 'Boutique',
};

interface ClubCardProps {
  club: Club;
  onClick: () => void;
  isDragging?: boolean;
}

export function ClubCard({ club, onClick, isDragging }: ClubCardProps) {
  const getTierClass = (tier: string | null | undefined) => {
    switch (tier) {
      case 'group_owned': return 'tier-group-owned';
      case 'large': return 'tier-large';
      case 'multi_court': return 'tier-multi-court';
      case 'boutique': return 'tier-boutique';
      default: return 'tier-boutique';
    }
  };

  const getPriorityClass = (priority: string | null | undefined) => {
    switch (priority) {
      case 'high': return 'priority-dot-high';
      case 'medium': return 'priority-dot-medium';
      case 'low': return 'priority-dot-low';
      default: return 'priority-dot-medium';
    }
  };

  const isGroupOwned = club.tier === 'group_owned' || club.ownership_group;

  return (
    <div 
      onClick={onClick}
      className={cn(
        'club-card',
        isDragging && 'shadow-lg ring-2 ring-primary/30 rotate-2',
        isGroupOwned && 'border-primary/30 bg-gradient-to-br from-primary/5 to-transparent'
      )}
    >
      <div className="card-header">
        <div className="flex items-center gap-1 min-w-0">
          {isGroupOwned && <Crown className="card-icon-sm text-primary" />}
          <h4 className="card-title line-clamp-1">
            {club.club_name}
          </h4>
        </div>
        <div className={cn('priority-dot flex-shrink-0', getPriorityClass(club.priority))} />
      </div>

      {club.instagram_handle && (
        <div className="card-meta mb-1">
          <Instagram className="card-icon-sm" />
          <span className="line-clamp-1">@{club.instagram_handle.replace('@', '')}</span>
        </div>
      )}

      <div className="card-meta-row">
        {(club.city || club.country) && (
          <div className="card-meta">
            <MapPin className="card-icon-sm" />
            <span>{club.city ? `${club.city}, ${club.country || 'South Africa'}` : (club.country || 'South Africa')}</span>
          </div>
        )}
        {club.number_of_courts && (
          <div className="card-meta">
            <Building2 className="card-icon-sm" />
            <span>{club.number_of_courts} courts</span>
          </div>
        )}
      </div>

      {club.ownership_group && (
        <div className="card-meta mb-1.5">
          <Users className="card-icon-sm" />
          <span className="line-clamp-1">{club.ownership_group}</span>
        </div>
      )}

      <div className="card-footer">
        {club.tier && (
          <span className={cn('tier-badge', getTierClass(club.tier))}>
            {TIER_LABELS[club.tier] || club.tier}
          </span>
        )}
        {(club.total_dms || 0) > 0 && (
          <div className="card-meta">
            <MessageSquare className="card-icon-sm" />
            <span>{club.total_dms}</span>
          </div>
        )}
      </div>

      {club.next_action && (
        <div className="card-divider">
          <p className="text-xs text-muted-foreground line-clamp-1">
            → {club.next_action}
          </p>
        </div>
      )}
    </div>
  );
}
