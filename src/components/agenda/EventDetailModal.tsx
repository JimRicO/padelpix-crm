import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Building2, Trash2, Save, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MarkdownPreview } from '@/components/ui/markdown-renderer';
import { useClubs } from '@/hooks/useClubs';
import { useUpdateAgendaEvent, useDeleteAgendaEvent } from '@/hooks/useAgendaEvents';
import type { AgendaEvent } from '@/hooks/useAgendaEvents';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EventDetailModalProps {
  event: AgendaEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClubClick?: (clubId: string) => void;
}

export function EventDetailModal({ event, open, onOpenChange, onClubClick }: EventDetailModalProps) {
  const { data: clubs = [] } = useClubs();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();

  const getInitialFormData = () => ({
    date: event ? new Date(event.event_date) : new Date(),
    time: event?.event_time || '',
    title: event?.title || '',
    description: event?.description || '',
    clubId: event?.club_id || 'none',
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [initialFormData, setInitialFormData] = useState(getInitialFormData);

  // Reset form when event changes
  useEffect(() => {
    if (event) {
      const data = getInitialFormData();
      setFormData(data);
      setInitialFormData(data);
    }
  }, [event]);

  if (!event) return null;

  const isSystem = event.event_type === 'system';
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

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

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      await updateEvent.mutateAsync({
        id: event.id,
        event_date: format(formData.date, 'yyyy-MM-dd'),
        event_time: formData.time || null,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        club_id: formData.clubId === 'none' ? null : formData.clubId,
      });

      toast.success('Event updated');
      const newData = {
        date: formData.date,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim(),
        clubId: formData.clubId,
      };
      setInitialFormData(newData);
    } catch {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent.mutateAsync(event.id);
      toast.success('Event deleted');
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete event');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {isSystem ? 'Event Details' : 'Edit Event'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-2">
            {/* Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {event.event_time && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.event_time)}
                </Badge>
              )}
              {isSystem && (
                <Badge variant="secondary">Auto-generated</Badge>
              )}
              {event.clubs && (
                <Badge 
                  variant="outline" 
                  className="gap-1 cursor-pointer hover:bg-muted"
                  onClick={() => onClubClick?.(event.clubs!.id)}
                >
                  <Building2 className="w-3 h-3" />
                  {event.clubs.club_name}
                </Badge>
              )}
            </div>

            {/* System event - read only */}
            {isSystem ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Title</Label>
                  <p className="text-sm">{event.title}</p>
                </div>
                {event.description && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <MarkdownPreview content={event.description} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Editable form for manual events */
              <div className="space-y-4">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
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
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Event title"
                  />
                </div>

                {/* Description with Markdown */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add notes or details (supports markdown)"
                    rows={4}
                  />
                  {formData.description && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Preview:</span>
                      <MarkdownPreview content={formData.description} />
                    </div>
                  )}
                </div>

                {/* Club Selector */}
                <div className="space-y-2">
                  <Label htmlFor="club">Linked Club (optional)</Label>
                  <Select 
                    value={formData.clubId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, clubId: value }))}
                  >
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
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        {!isSystem && (
          <div className="flex justify-between pt-4 border-t flex-shrink-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. The event will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button 
              onClick={handleSave} 
              disabled={updateEvent.isPending || !hasChanges}
              className={hasChanges && !updateEvent.isPending ? 'bg-primary hover:bg-primary/90' : ''}
              variant={hasChanges && !updateEvent.isPending ? 'default' : 'secondary'}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}

        {/* Close for system events */}
        {isSystem && (
          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
