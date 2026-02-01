import { useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayEventsPopover } from './DayEventsPopover';
import { cn } from '@/lib/utils';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';

interface CalendarViewProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  events: AgendaEvent[];
  onClubClick?: (clubId: string) => void;
  onAddEvent?: (date: Date) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarView({
  currentMonth,
  onMonthChange,
  events,
  onClubClick,
  onAddEvent,
}: CalendarViewProps) {
  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Group events by date key for quick lookup
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, AgendaEvent[]> = {};
    events.forEach((event) => {
      const dateKey = event.event_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [events]);

  const handlePrevMonth = () => {
    onMonthChange(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    onMonthChange(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const hasEvents = dayEvents.length > 0;
          const manualEvents = dayEvents.filter((e) => e.event_type === 'manual');
          const systemEvents = dayEvents.filter((e) => e.event_type === 'system');

          return (
            <DayEventsPopover
              key={dateKey}
              date={day}
              events={dayEvents}
              onClubClick={onClubClick}
              onAddEvent={onAddEvent}
            >
              <button
                className={cn(
                  'relative aspect-square p-1 rounded-lg transition-all',
                  'hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  !isCurrentMonth && 'text-muted-foreground/40',
                  isTodayDate && 'bg-primary/10 ring-1 ring-primary/30',
                  hasEvents && isCurrentMonth && 'font-medium'
                )}
              >
                <span
                  className={cn(
                    'text-sm',
                    isTodayDate && 'text-primary font-semibold'
                  )}
                >
                  {format(day, 'd')}
                </span>

                {/* Event Indicators */}
                {hasEvents && isCurrentMonth && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                    {manualEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    {systemEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    )}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] text-muted-foreground ml-0.5">
                        +{dayEvents.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            </DayEventsPopover>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span>Manual events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
          <span>System events</span>
        </div>
      </div>
    </div>
  );
}
