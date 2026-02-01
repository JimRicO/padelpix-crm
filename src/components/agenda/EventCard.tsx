import { Clock, Building2, MapPin, PartyPopper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';

interface EventCardProps {
  event: AgendaEvent;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const isSystem = event.event_type === 'system';
  const isIndustry = (event.event_type as string) === 'industry';

  const formatTime = (time: string | null) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Card 
      className={cn(
        'transition-all cursor-pointer hover:scale-[1.01]',
        isSystem && 'bg-muted/50 border-dashed border border-muted-foreground/20 shadow-none',
        isIndustry && 'border-l-4 border-l-pink-500 bg-pink-500/5'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {event.event_time && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.event_time)}
                </Badge>
              )}
              {isSystem && (
                <Badge variant="secondary" className="text-xs">
                  Auto
                </Badge>
              )}
              {isIndustry && (
                <Badge variant="outline" className="text-xs bg-pink-500/10 text-pink-600 border-pink-500/20">
                  <PartyPopper className="w-3 h-3 mr-1" />
                  Event
                </Badge>
              )}
            </div>
            
            <h4 className={cn(
              'font-medium text-sm truncate',
              isSystem && 'text-muted-foreground'
            )}>
              {event.title}
            </h4>
            
            {event.clubs && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{event.clubs.club_name}</span>
              </div>
            )}

            {isIndustry && event.description && (
              <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{event.description}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
