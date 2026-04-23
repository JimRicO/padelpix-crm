import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Building2, Trash2, Save, X, MapPin, ExternalLink, PartyPopper } from 'lucide-react';
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
  event: (AgendaEvent & { _industryEvent?: any }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClubClick?: (clubId: string) => void;
}

export function EventDetailModal({ event, open, onOpenChange, onClubClick }: EventDetailModalProps) {
  const navigate = useNavigate();
  const { data: clubs = [] } = useClubs();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();

  const getInitialFormData = () => ({
    date: event ? new Date(event.event_date) : new Date(),
    endDate: event?.end_date ? new Date(event.end_date) : undefined as Date | undefined,
    time: event?.event_time || '',
    title: event?.title || '',
    description: event?.description || '',
    clubId: event?.club_id || 'none',
    eventType: (event?.event_type as 'manual' | 'system' | 'task' | 'industry') || 'manual',
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [initialFormData, setInitialFormData] = useState(getInitialFormData);

  useEffect(() => {
    if (event) {
      const data = getInitialFormData();
      setFormData(data);
      setInitialFormData(data);
    }
  }, [event]);

  if (!event) return null;

  const isSystem = event.event_type === 'system';
  const isIndustry = (event.event_type as string) === 'industry';
  const industryEvent = event._industryEvent;
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
        end_date: formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : null,
        event_time: formData.time || null,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        club_id: formData.clubId === 'none' ? null : formData.clubId,
        event_type: formData.eventType,
      });

      toast.success('Event updated');
      setInitialFormData({
        date: formData.date,
        endDate: formData.endDate,
        time: formData.time,
        title: formData.title.trim(),
        description: formData.description.trim(),
        clubId: formData.clubId,
        eventType: formData.eventType,
      });
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
            {isIndustry ? (
              <PartyPopper className="w-5 h-5 text-pink-500" />
            ) : (
              <CalendarIcon className="w-5 h-5 text-primary" />
            )}
            {isIndustry ? 'Industry Event' : isSystem ? 'Event Details' : 'Edit Event'}
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
              {isIndustry && (
                <Badge variant="outline" className="gap-1 bg-pink-500/10 text-pink-600 border-pink-500/20">
                  <PartyPopper className="w-3 h-3" />
                  Industry Event
                </Badge>
              )}
            </div>

            {/* Industry event - show info and link to Events page */}
            {isIndustry && industryEvent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Event</Label>
                  <p className="text-sm font-medium">{industryEvent.name}</p>
                </div>

                {industryEvent.location && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Venue</Label>
                    <p className="text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {industryEvent.location}
                    </p>
                  </div>
                )}

                {(industryEvent.city || industryEvent.country) && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Location</Label>
                    <p className="text-sm">
                      {[industryEvent.city, industryEvent.country].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}

                {industryEvent.description && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm text-muted-foreground">{industryEvent.description}</p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/events');
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View in Events
                </Button>
              </div>
            )}

            {/* System event - read only */}
            {isSystem && !isIndustry && (
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
            )}

            {/* Editable form for manual events */}
            {!isSystem && !isIndustry && (
              <div className="space-y-4">
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
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
                          {formData.date ? format(formData.date, 'MMM d, yyyy') : 'Pick a date'}
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

                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
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

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add any details..."
                    rows={3}
                    className="neu-pressed"
                  />
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

        {/* Footer Actions for manual events */}
        {!isSystem && !isIndustry && (
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
        {isSystem && !isIndustry && (
          <div className="flex justify-end pt-4 border-t flex-shrink-0">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        )}

        {/* Close for industry events */}
        {isIndustry && (
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
