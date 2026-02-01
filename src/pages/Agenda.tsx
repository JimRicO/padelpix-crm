import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, startOfDay, compareAsc } from 'date-fns';
import { Plus, Calendar, List } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EventDateGroup } from '@/components/agenda/EventDateGroup';
import { CalendarView } from '@/components/agenda/CalendarView';
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
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // Default to February 2026
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1));

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

  // Group events by date for list view
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

  const handleAddEventFromCalendar = (date: Date) => {
    setPrefilledDate(date);
    setAddEventOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setAddEventOpen(open);
    if (!open) {
      setPrefilledDate(undefined);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
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
        {/* View Toggle Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}
          className="w-full"
        >
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="calendar" className="gap-1.5">
                <Calendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="w-4 h-4" />
                List
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Calendar View */}
          <TabsContent value="calendar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-muted-foreground">Loading events...</div>
              </div>
            ) : (
              <CalendarView
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                events={filteredEvents}
                onDeleteEvent={handleDeleteEvent}
                onClubClick={handleClubClick}
                onAddEvent={handleAddEventFromCalendar}
              />
            )}
          </TabsContent>

          {/* List View */}
          <TabsContent value="list">
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
          </TabsContent>
        </Tabs>
      </main>

      <AddEventDialog
        open={addEventOpen}
        onOpenChange={handleDialogClose}
        prefilledDate={prefilledDate}
      />
    </div>
  );
}
