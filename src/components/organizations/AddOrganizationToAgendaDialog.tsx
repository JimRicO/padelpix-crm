import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCreateAgendaEvent } from '@/hooks/useAgendaEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddOrganizationToAgendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
}

export function AddOrganizationToAgendaDialog({ 
  open, 
  onOpenChange, 
  organizationName 
}: AddOrganizationToAgendaDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('');
  const [title, setTitle] = useState(`Follow up: ${organizationName}`);
  const [description, setDescription] = useState('');

  const createEvent = useCreateAgendaEvent();

  // Update title when organization changes
  useEffect(() => {
    setTitle(`Follow up: ${organizationName}`);
  }, [organizationName]);

  const resetForm = () => {
    setDate(new Date());
    setTime('');
    setTitle(`Follow up: ${organizationName}`);
    setDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !title.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await createEvent.mutateAsync({
        event_date: format(date, 'yyyy-MM-dd'),
        event_time: time || null,
        title: title.trim(),
        description: description.trim() || null,
        club_id: null, // Organizations don't have a club_id link yet
      });

      toast.success('Event added to agenda');
      resetForm();
      onOpenChange(false);
    } catch {
      toast.error('Failed to create event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Add to Agenda</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'MMM d, yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details..."
              rows={3}
              className="neu-pressed"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Adding...' : 'Add to Agenda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
