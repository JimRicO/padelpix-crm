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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MarkdownPreview } from '@/components/ui/markdown-renderer';
import { useClubs } from '@/hooks/useClubs';
import { useCreateAgendaEvent } from '@/hooks/useAgendaEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledDate?: Date;
}

export function AddEventDialog({ open, onOpenChange, prefilledDate }: AddEventDialogProps) {
  const [date, setDate] = useState<Date | undefined>(prefilledDate);
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [clubId, setClubId] = useState<string>('none');

  // Update date when prefilledDate changes
  useEffect(() => {
    if (prefilledDate) {
      setDate(prefilledDate);
    }
  }, [prefilledDate]);

  const { data: clubs = [] } = useClubs();
  const createEvent = useCreateAgendaEvent();

  const resetForm = () => {
    setDate(undefined);
    setTime('');
    setTitle('');
    setDescription('');
    setClubId('none');
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
        club_id: clubId === 'none' ? null : clubId,
      });

      toast.success('Event created');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
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
                  {date ? format(date, 'PPP') : 'Pick a date'}
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

          {/* Time Picker */}
          <div className="space-y-2">
            <Label htmlFor="time">Time (optional)</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or details (supports markdown)"
              rows={3}
            />
            {description && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">Preview</Label>
                <MarkdownPreview content={description} />
              </div>
            )}
          </div>

          {/* Club Selector */}
          <div className="space-y-2">
            <Label htmlFor="club">Link to Club (optional)</Label>
            <Select value={clubId} onValueChange={setClubId}>
              <SelectTrigger id="club">
                <SelectValue placeholder="Select a club" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {clubs.map((club) => (
                  <SelectItem key={club.id} value={club.id}>
                    {club.club_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
