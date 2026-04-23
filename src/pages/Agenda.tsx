import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { format, isToday, isTomorrow, isPast, startOfDay, compareAsc, eachDayOfInterval, parseISO } from 'date-fns';
import { Plus, Calendar, List, CheckSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EventDateGroup } from '@/components/agenda/EventDateGroup';
import { CalendarView } from '@/components/agenda/CalendarView';
import { AddEventDialog } from '@/components/agenda/AddEventDialog';
import { useAgendaEvents, type AgendaEvent } from '@/hooks/useAgendaEvents';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';

interface GroupedEvents {
  label: string;
  date: Date;
  events: AgendaEvent[];
  isPast: boolean;
}

export default function Agenda() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // Default to current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const { data: agendaEvents = [], isLoading: agendaLoading } = useAgendaEvents();
  const { data: industryEvents = [], isLoading: eventsLoading } = useEvents();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();

  const isLoading = agendaLoading || eventsLoading || tasksLoading;

  // Convert industry events to agenda format (expand multi-day events)
  const convertedIndustryEvents = useMemo((): AgendaEvent[] => {
    const converted: AgendaEvent[] = [];

    industryEvents.forEach((event) => {
      const startDate = parseISO(event.start_date);
      const endDate = event.end_date ? parseISO(event.end_date) : startDate;

      // Create an entry for each day of the event
      const days = eachDayOfInterval({ start: startDate, end: endDate });

      days.forEach((day, index) => {
        const isMultiDay = days.length > 1;
        const dayLabel = isMultiDay ? ` (Day ${index + 1}/${days.length})` : '';

        converted.push({
          id: `industry-${event.id}-${format(day, 'yyyy-MM-dd')}`,
          event_date: format(day, 'yyyy-MM-dd'),
          end_date: null,
          event_time: null,
          title: `${event.name}${dayLabel}`,
          description: [event.location, event.city, event.country].filter(Boolean).join(', ') || event.description,
          event_type: 'industry' as any, // Special type for styling
          club_id: null,
          created_by: event.created_by,
          created_at: event.created_at,
          clubs: null,
          // Store original event data for reference
          _industryEvent: event,
        } as AgendaEvent & { _industryEvent?: typeof event });
      });
    });

    return converted;
  }, [industryEvents]);

  // Convert tasks with due dates to agenda format
  const convertedTasks = useMemo((): AgendaEvent[] => {
    return tasks
      .filter((task) => task.due_date && task.status !== 'completed')
      .map((task) => ({
        id: `task-${task.id}`,
        event_date: format(parseISO(task.due_date!), 'yyyy-MM-dd'),
        end_date: null,
        event_time: null,
        title: `📋 ${task.title}`,
        description: task.description || null,
        event_type: 'task' as any,
        club_id: task.club_id,
        created_by: task.created_by || '',
        created_at: task.created_at || '',
        clubs: null,
      }));
  }, [tasks]);

  // Merge agenda events with industry events and tasks
  const allEvents = useMemo(() => {
    // Expand multi-day manual/system/task/industry events stored on agenda_events
    const expanded: AgendaEvent[] = [];
    agendaEvents.forEach((ev) => {
      if (ev.end_date && ev.end_date !== ev.event_date) {
        try {
          const start = parseISO(ev.event_date);
          const end = parseISO(ev.end_date);
          const days = eachDayOfInterval({ start, end });
          days.forEach((day, idx) => {
            const isMulti = days.length > 1;
            expanded.push({
              ...ev,
              id: `${ev.id}-day-${idx}`,
              event_date: format(day, 'yyyy-MM-dd'),
              title: isMulti ? `${ev.title} (Day ${idx + 1}/${days.length})` : ev.title,
            });
          });
        } catch {
          expanded.push(ev);
        }
      } else {
        expanded.push(ev);
      }
    });
    return [...expanded, ...convertedIndustryEvents, ...convertedTasks];
  }, [agendaEvents, convertedIndustryEvents, convertedTasks]);

  // Filter events based on search
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return allEvents;
    const query = searchQuery.toLowerCase();
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.clubs?.club_name.toLowerCase().includes(query)
    );
  }, [allEvents, searchQuery]);

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
