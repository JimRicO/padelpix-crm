import { forwardRef } from 'react';
import { Club } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Crown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubCardCompactProps {
  club: Club;
  onClick: () => void;
  isDragging?: boolean;
}

export const ClubCardCompact = forwardRef<HTMLDivElement, ClubCardCompactProps>(
  ({ club, onClick, isDragging }, ref) => {
    const isGroupOwned = club.tier === 'group_owned' || club.ownership_group;

    return (
      <div 
        ref={ref}
        onClick={onClick}
        className={cn(
          'club-card-row',
          isDragging && 'shadow-md ring-2 ring-primary/30'
        )}
      >
        <div className="w-4 h-4 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
          <Check className="w-3 h-3 text-success" />
        </div>
        <span className="font-medium truncate flex-1">{club.club_name}</span>
        {isGroupOwned && <Crown className="w-3 h-3 text-primary flex-shrink-0" />}
      </div>
    );
  }
);

ClubCardCompact.displayName = 'ClubCardCompact';
