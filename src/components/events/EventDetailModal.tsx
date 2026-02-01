import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUpdateEvent, useDeleteEvent, EVENT_TYPES, EVENT_STATUSES, type Event } from '@/hooks/useEvents';

interface EventDetailModalProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventDetailModal({ event, open, onOpenChange }: EventDetailModalProps) {
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    event_type: 'conference',
    status: 'upcoming',
    start_date: null as Date | null,
    end_date: null as Date | null,
    location: '',
    city: '',
    country: '',
    website: '',
    description: '',
    notes: '',
  });

  const initialFormData = useMemo(() => ({
    name: event?.name || '',
    event_type: event?.event_type || 'conference',
    status: event?.status || 'upcoming',
    start_date: event?.start_date ? parseISO(event.start_date) : null,
    end_date: event?.end_date ? parseISO(event.end_date) : null,
    location: event?.location || '',
    city: event?.city || '',
    country: event?.country || '',
    website: event?.website || '',
    description: event?.description || '',
    notes: event?.notes || '',
  }), [event]);

  useEffect(() => {
    if (event) {
      setFormData(initialFormData);
    }
  }, [event, initialFormData]);

  const hasChanges = useMemo(() => {
    return (
      formData.name !== initialFormData.name ||
      formData.event_type !== initialFormData.event_type ||
      formData.status !== initialFormData.status ||
      formData.start_date?.getTime() !== initialFormData.start_date?.getTime() ||
      formData.end_date?.getTime() !== initialFormData.end_date?.getTime() ||
      formData.location !== initialFormData.location ||
      formData.city !== initialFormData.city ||
      formData.country !== initialFormData.country ||
      formData.website !== initialFormData.website ||
      formData.description !== initialFormData.description ||
      formData.notes !== initialFormData.notes
    );
  }, [formData, initialFormData]);

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWebsiteBlur = () => {
    const website = formData.website.trim();
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      setFormData(prev => ({ ...prev, website: `https://${website}` }));
    }
  };

  const handleSave = async () => {
    if (!event || !formData.name.trim() || !formData.start_date) return;

    await updateEvent.mutateAsync({
      id: event.id,
      name: formData.name.trim(),
      event_type: formData.event_type,
      status: formData.status,
      start_date: format(formData.start_date, 'yyyy-MM-dd'),
      end_date: formData.end_date ? format(formData.end_date, 'yyyy-MM-dd') : null,
      location: formData.location.trim() || null,
      city: formData.city.trim() || null,
      country: formData.country.trim() || null,
      website: formData.website.trim() || null,
      description: formData.description.trim() || null,
      notes: formData.notes.trim() || null,
    });

    onOpenChange(false);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!event) return;
    await deleteEvent.mutateAsync(event.id);
    setShowDeleteDialog(false);
    onOpenChange(false);
  };

  if (!event) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{event.name}</DialogTitle>
              <div className="flex items-center gap-2">
                {event.website && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(event.website!, '_blank')}
                    className="h-8 px-2"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Website
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-140px)]">
            <div className="p-6 space-y-5">
              {/* Event Name */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Event Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>

              {/* Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.event_type} onValueChange={(v) => updateField('event_type', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => updateField('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.start_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(formData.start_date, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.start_date || undefined}
                        onSelect={(date) => updateField('start_date', date || null)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.end_date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(formData.end_date, 'PPP') : 'Optional'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.end_date || undefined}
                        onSelect={(date) => updateField('end_date', date || null)}
                        disabled={(date) => formData.start_date ? date < formData.start_date : false}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="edit-location">Venue / Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Cape Town ICC"
                />
              </div>

              {/* City & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label htmlFor="edit-website">Website</Label>
                <Input
                  id="edit-website"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  onBlur={handleWebsiteBlur}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={2}
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                  className="neu-pressed"
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || !formData.name.trim() || !formData.start_date || updateEvent.isPending}
            >
              {updateEvent.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{event.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
