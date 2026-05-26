import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Image as ImageIcon, Send, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ClubContentTabProps {
  clubId: string;
}

export function ClubContentTab({ clubId }: ClubContentTabProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: '',
    dimensions: '',
    image_url: '',
  });

  const { data: content, isLoading } = useQuery({
    queryKey: ['content', clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createContent = useMutation({
    mutationFn: async (piece: typeof formData) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('content_pieces')
        .insert({
          club_id: clubId,
          title: piece.title,
          description: piece.description || null,
          style: piece.style || null,
          dimensions: piece.dimensions || null,
          image_url: piece.image_url || null,
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', clubId] });
      toast({ title: 'Content created' });
    },
  });

  const updateContentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: Record<string, unknown> = { status };
      if (status === 'sent') {
        updates.sent_date = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('content_pieces')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', clubId] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContent.mutate(formData);
    setFormData({ title: '', description: '', style: '', dimensions: '', image_url: '' });
    setShowForm(false);
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading content...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Content Pieces</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1" />
          Add Content
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 space-y-3">
          <Input 
            placeholder="Content title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea 
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input 
              placeholder="Style (e.g., Minimalist)"
              value={formData.style}
              onChange={(e) => setFormData(prev => ({ ...prev, style: e.target.value }))}
            />
            <Input 
              placeholder="Dimensions (e.g., 1080x1080)"
              value={formData.dimensions}
              onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
            />
          </div>
          <Input 
            placeholder="Image URL (optional)"
            value={formData.image_url}
            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={createContent.isPending}>
              {createContent.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      )}

      {!content?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          No content yet. Create your first piece!
        </div>
      ) : (
        <div className="grid gap-3">
          {content.map(piece => (
            <div key={piece.id} className="flex gap-4 p-4 bg-card rounded-lg border">
              <div className="w-20 h-20 rounded bg-muted flex items-center justify-center flex-shrink-0">
                {piece.image_url ? (
                  <img 
                    src={piece.image_url} 
                    alt={piece.title}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-sm">{piece.title}</h4>
                  <ContentStatusBadge status={piece.status} />
                </div>
                {piece.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{piece.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  {piece.style && <span>{piece.style}</span>}
                  {piece.dimensions && <span>{piece.dimensions}</span>}
                  <span>{piece.created_date && format(new Date(piece.created_date), 'MMM d')}</span>
                </div>
                {piece.status !== 'sent' && (
                  <div className="flex gap-2 mt-3">
                    {piece.status === 'draft' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => updateContentStatus.mutate({ id: piece.id, status: 'ready' })}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Ready
                      </Button>
                    )}
                    {piece.status === 'ready' && (
                      <Button 
                        size="sm"
                        onClick={() => updateContentStatus.mutate({ id: piece.id, status: 'sent' })}
                      >
                        <Send className="w-3 h-3 mr-1" />
                        Mark Sent
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContentStatusBadge({ status }: { status: string | null }) {
  return (
    <span className={cn(
      'text-xs px-2 py-0.5 rounded',
      status === 'draft' && 'bg-muted text-muted-foreground',
      status === 'ready' && 'bg-warning/10 text-warning',
      status === 'sent' && 'bg-success/10 text-success',
    )}>
      {status || 'draft'}
    </span>
  );
}
