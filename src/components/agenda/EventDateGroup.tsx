import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { EventCard } from './EventCard';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';

interface EventDateGroupProps {
  label: string;
  events: AgendaEvent[];
  defaultOpen?: boolean;
  onDeleteEvent?: (id: string) => void;
  onClubClick?: (clubId: string) => void;
}

export function EventDateGroup({ 
  label, 
  events, 
  defaultOpen = true,
  onDeleteEvent,
  onClubClick,
}: EventDateGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 group">
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="font-medium text-sm">{label}</span>
        <span className="text-xs text-muted-foreground">
          ({events.length} {events.length === 1 ? 'event' : 'events'})
        </span>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pl-6 space-y-2 pb-4">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onDelete={onDeleteEvent}
            onClubClick={onClubClick}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
