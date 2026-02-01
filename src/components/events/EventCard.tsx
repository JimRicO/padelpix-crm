import { useState } from 'react';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Globe, 
  ExternalLink, 
  Trash2,
  PartyPopper,
  Users,
  Store,
  Trophy,
  Presentation,
  HelpCircle,
} from 'lucide-react';
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
import { useDeleteEvent, type Event } from '@/hooks/useEvents';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const TYPE_CONFIG: Record<string, { icon: typeof Calendar; label: string; className: string }> = {
  festival: { icon: PartyPopper, label: 'Festival', className: 'bg-pink-500/10 text-pink-600' },
  conference: { icon: Users, label: 'Conference', className: 'bg-blue-500/10 text-blue-600' },
  fair: { icon: Store, label: 'Fair', className: 'bg-amber-500/10 text-amber-600' },
  exhibition: { icon: Presentation, label: 'Exhibition', className: 'bg-purple-500/10 text-purple-600' },
  tournament: { icon: Trophy, label: 'Tournament', className: 'bg-green-500/10 text-green-600' },
  other: { icon: HelpCircle, label: 'Other', className: 'bg-muted text-muted-foreground' },
};

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  interested: { label: 'Interested', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20' },
  upcoming: { label: 'Upcoming', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  attending: { label: 'Attending', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  attended: { label: 'Attended', className: 'bg-muted text-muted-foreground border-muted' },
  cancelled: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

export function EventCard({ event, onClick }: EventCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteEvent = useDeleteEvent();

  const typeConfig = TYPE_CONFIG[event.event_type] || TYPE_CONFIG.other;
  const statusConfig = STATUS_CONFIG[event.status] || STATUS_CONFIG.upcoming;
  const TypeIcon = typeConfig.icon;

  const startDate = parseISO(event.start_date);
  const endDate = event.end_date ? parseISO(event.end_date) : null;
  const isEventPast = isPast(endDate || startDate);

  const formatDateRange = () => {
    const start = format(startDate, 'MMM d, yyyy');
    if (endDate) {
      const end = format(endDate, 'MMM d, yyyy');
      return `${start} – ${end}`;
    }
    return start;
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteEvent.mutate(event.id);
    setShowDeleteDialog(false);
  };

  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.website) {
      window.open(event.website, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      <Card 
        className={`cursor-pointer hover:shadow-md transition-shadow ${isEventPast ? 'opacity-60' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            {/* Type Icon */}
            <div className={`card-avatar flex items-center justify-center ${typeConfig.className}`}>
              <TypeIcon className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Header: Name + Badges */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="card-title">{event.name}</h3>
                <Badge variant="outline" className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
                <Badge variant="outline" className={typeConfig.className}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeConfig.label}
                </Badge>
                <div className="ml-auto flex items-center gap-1">
                  {event.website && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleWebsiteClick}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Meta row */}
              <div className="card-meta-row">
                <div className="card-meta">
                  <Calendar className="card-icon-sm" />
                  <span>{formatDateRange()}</span>
                </div>
                {(event.city || event.country) && (
                  <div className="card-meta">
                    <MapPin className="card-icon-sm" />
                    <span>
                      {[event.city, event.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {event.location && (
                  <div className="card-meta">
                    <Globe className="card-icon-sm" />
                    <span className="truncate max-w-[200px]">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
