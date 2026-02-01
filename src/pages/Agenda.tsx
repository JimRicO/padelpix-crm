import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, startOfDay, compareAsc } from 'date-fns';
import { Plus, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EventDateGroup } from '@/components/agenda/EventDateGroup';
import { AddEventDialog } from '@/components/agenda/AddEventDialog';
import { useAgendaEvents, useDeleteAgendaEvent } from '@/hooks/useAgendaEvents';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface GroupedEvents {
  label: string;
  date: Date;
  events: ReturnType<typeof useAgendaEvents>['data'];
  isPast: boolean;
}

export default function Agenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);

  const { data: events = [], isLoading } = useAgendaEvents();
  const deleteEvent = useDeleteAgendaEvent();

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.clubs?.club_name.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: Record<string, GroupedEvents> = {};

    filteredEvents.forEach((event) => {
      const eventDate = new Date(event.event_date);
      const dateKey = format(eventDate, 'yyyy-MM-dd');

      if (!groups[dateKey]) {
        let label: string;
        if (isToday(eventDate)) {
          label = 'Today';
        } else if (isTomorrow(eventDate)) {
          label = 'Tomorrow';
        } else {
          label = format(eventDate, 'EEEE, d MMMM yyyy');
        }

        groups[dateKey] = {
          label,
          date: startOfDay(eventDate),
          events: [],
          isPast: isPast(eventDate) && !isToday(eventDate),
        };
      }

      groups[dateKey].events!.push(event);
    });

    // Sort: Today first, then future dates, then past dates at the end
    return Object.values(groups).sort((a, b) => {
      if (a.isPast !== b.isPast) {
        return a.isPast ? 1 : -1;
      }
      return compareAsc(a.date, b.date);
    });
  }, [filteredEvents]);

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent.mutateAsync(id);
      toast.success('Event deleted');
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleClubClick = (clubId: string) => {
    navigate('/');
  };

  // Redirect to auth if not logged in - using useEffect to avoid hooks order issues
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search events..."
        actions={
          <Button onClick={() => setAddEventOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        }
      />

      <main className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading events...</div>
          </div>
        ) : groupedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">No events yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'No events match your search'
                : 'Create your first event to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setAddEventOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {groupedEvents.map((group) => (
              <EventDateGroup
                key={group.label}
                label={group.label}
                events={group.events!}
                defaultOpen={!group.isPast}
                onDeleteEvent={handleDeleteEvent}
                onClubClick={handleClubClick}
              />
            ))}
          </div>
        )}
      </main>

      <AddEventDialog open={addEventOpen} onOpenChange={setAddEventOpen} />
    </div>
  );
}
