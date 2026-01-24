import { Club } from '@/types/database';
import { Crown, Check } from 'lucide-react';
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
        'card-compact',
        isDragging && 'shadow-md ring-2 ring-primary/30'
      )}
    >
      <div className="w-3.5 h-3.5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
        <Check className="w-2.5 h-2.5 text-success" />
      </div>
      <span className="card-title flex-1">{club.club_name}</span>
      {isGroupOwned && <Crown className="card-icon-sm text-primary" />}
    </div>
  );
}
