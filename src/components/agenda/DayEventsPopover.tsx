import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Calendar } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EventCard } from './EventCard';
import { EventDetailModal } from './EventDetailModal';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';

interface DayEventsPopoverProps {
  date: Date;
  events: AgendaEvent[];
  children: React.ReactNode;
  onClubClick?: (clubId: string) => void;
  onAddEvent?: (date: Date) => void;
}

export function DayEventsPopover({
  date,
  events,
  children,
  onClubClick,
  onAddEvent,
}: DayEventsPopoverProps) {
  const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.event_time && !b.event_time) return 0;
    if (!a.event_time) return 1;
    if (!b.event_time) return -1;
    return a.event_time.localeCompare(b.event_time);
  });

  const handleEventClick = (event: AgendaEvent) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-sm">
                {format(date, 'EEEE, MMMM d')}
              </span>
            </div>
            {onAddEvent && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => onAddEvent(date)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
          </div>

          {/* Events List */}
          {sortedEvents.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No events scheduled
            </div>
          ) : (
            <ScrollArea className="max-h-64">
              <div className="p-2 space-y-2">
                {sortedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={() => handleEventClick(event)}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </PopoverContent>
      </Popover>

      <EventDetailModal
        event={selectedEvent}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onClubClick={onClubClick}
      />
    </>
  );
}
