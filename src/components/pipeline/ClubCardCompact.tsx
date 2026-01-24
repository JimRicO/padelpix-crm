import { Club } from '@/types/database';
import { Checkbox } from '@/components/ui/checkbox';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClubCardCompactProps {
  club: Club;
  onClick: () => void;
  isDragging?: boolean;
}

export function ClubCardCompact({ club, onClick, isDragging }: ClubCardCompactProps) {
  const isGroupOwned = club.tier === 'group_owned' || club.ownership_group;

  return (
    <div 
      onClick={onClick}
      className={cn(
        'club-card-row',
        isDragging && 'shadow-md ring-2 ring-primary/30'
      )}
    >
      <Checkbox checked disabled className="pointer-events-none" />
      <span className="font-medium text-sm truncate flex-1">{club.club_name}</span>
      {isGroupOwned && <Crown className="w-3 h-3 text-primary flex-shrink-0" />}
    </div>
  );
}
