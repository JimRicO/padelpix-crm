import { Club } from '@/types/database';
import { Instagram, MapPin, Building2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubCardProps {
  club: Club;
  onClick: () => void;
  isDragging?: boolean;
}

export function ClubCard({ club, onClick, isDragging }: ClubCardProps) {
  const getTierClass = (tier: string | null | undefined) => {
    switch (tier) {
      case 'enterprise': return 'tier-enterprise';
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

  return (
    <div 
      onClick={onClick}
      className={cn(
        'club-card',
        isDragging && 'shadow-lg ring-2 ring-primary/30 rotate-2'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-sm text-foreground line-clamp-1">
          {club.club_name}
        </h4>
        <div className={cn('priority-dot flex-shrink-0', getPriorityClass(club.priority))} />
      </div>

      {club.instagram_handle && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
          <Instagram className="w-3 h-3" />
          <span className="line-clamp-1">@{club.instagram_handle.replace('@', '')}</span>
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
        {club.city && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>{club.city}</span>
          </div>
        )}
        {club.number_of_courts && (
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            <span>{club.number_of_courts} courts</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        {club.tier && (
          <span className={cn('tier-badge', getTierClass(club.tier))}>
            {club.tier?.replace('_', ' ')}
          </span>
        )}
        {(club.total_dms || 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="w-3 h-3" />
            <span>{club.total_dms}</span>
          </div>
        )}
      </div>

      {club.next_action && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground line-clamp-1">
            → {club.next_action}
          </p>
        </div>
      )}
    </div>
  );
}
