import { useState } from 'react';
import { useActivities, useCreateActivity } from '@/hooks/useActivities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, MessageSquare, Heart, Send, Eye, Calendar, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

const ACTIVITY_TYPES = [
  { value: 'dm_sent', label: 'DM Sent', icon: Send },
  { value: 'dm_received', label: 'DM Received', icon: MessageSquare },
  { value: 'comment', label: 'Comment', icon: MessageSquare },
  { value: 'like', label: 'Like', icon: Heart },
  { value: 'story_view', label: 'Story View', icon: Eye },
  { value: 'call', label: 'Call', icon: MessageSquare },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'other', label: 'Other', icon: MessageSquare },
];

interface ClubActivitiesTabProps {
  clubId: string;
}

export function ClubActivitiesTab({ clubId }: ClubActivitiesTabProps) {
  const { data: activities, isLoading } = useActivities(clubId);
  const createActivity = useCreateActivity();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'dm_sent',
    title: '',
    description: '',
    link: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createActivity.mutate({
      club_id: clubId,
      activity_type: formData.activity_type,
      title: formData.title,
      description: formData.description || null,
      link: formData.link || null,
    });
    setFormData({ activity_type: 'dm_sent', title: '', description: '', link: '' });
    setShowForm(false);
  };

  const getActivityIcon = (type: string) => {
    const found = ACTIVITY_TYPES.find(t => t.value === type);
    return found ? found.icon : MessageSquare;
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Activity Timeline</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Activity
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select 
              value={formData.activity_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input 
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <Textarea 
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
          <Input 
            placeholder="Link (optional)"
            value={formData.link}
            onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createActivity.isPending}>
              {createActivity.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      {!activities?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          No activities yet. Add your first interaction!
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => {
            const Icon = getActivityIcon(activity.activity_type);
            return (
              <div key={activity.id} className="flex gap-3 p-3 bg-card rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {activity.activity_date && format(new Date(activity.activity_date), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                  )}
                  {activity.link && (
                    <a 
                      href={activity.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View link
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
