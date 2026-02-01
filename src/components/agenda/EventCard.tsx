import { Clock, Building2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { cn } from '@/lib/utils';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';

interface EventCardProps {
  event: AgendaEvent;
  onDelete?: (id: string) => void;
  onClubClick?: (clubId: string) => void;
}

export function EventCard({ event, onDelete, onClubClick }: EventCardProps) {
  const isSystem = event.event_type === 'system';

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
        'transition-all',
        isSystem && 'bg-muted/50 border-dashed border border-muted-foreground/20 shadow-none'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
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
            </div>
            
            <h4 className={cn(
              'font-medium text-sm',
              isSystem && 'text-muted-foreground'
            )}>
              {event.title}
            </h4>
            
            {event.description && (
              <div className={cn(
                'mt-2 text-xs',
                isSystem && 'text-muted-foreground'
              )}>
                <MarkdownRenderer content={event.description} />
              </div>
            )}
            
            {event.clubs && (
              <button
                onClick={() => onClubClick?.(event.clubs!.id)}
                className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <Building2 className="w-3 h-3" />
                {event.clubs.club_name}
              </button>
            )}
          </div>
          
          {!isSystem && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(event.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
