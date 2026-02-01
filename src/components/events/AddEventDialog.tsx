import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreateEvent, EVENT_TYPES, EVENT_STATUSES } from '@/hooks/useEvents';

interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const initialFormData = {
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
};

export function AddEventDialog({ open, onOpenChange }: AddEventDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const createEvent = useCreateEvent();

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleWebsiteBlur = () => {
    const website = formData.website.trim();
    if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
      setFormData(prev => ({ ...prev, website: `https://${website}` }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.start_date) return;

    await createEvent.mutateAsync({
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

    setFormData(initialFormData);
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setFormData(initialFormData);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Padel World Summit 2026"
              autoFocus
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
            <Label htmlFor="location">Venue / Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="e.g., Cape Town ICC"
            />
          </div>

          {/* City & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="e.g., Cape Town"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                placeholder="e.g., South Africa"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => updateField('website', e.target.value)}
              onBlur={handleWebsiteBlur}
              placeholder="example.com"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Brief description of the event..."
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Internal notes..."
              rows={2}
              className="neu-pressed"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.name.trim() || !formData.start_date || createEvent.isPending}
            >
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
