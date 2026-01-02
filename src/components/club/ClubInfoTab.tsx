import { useState } from 'react';
import { Club, PIPELINE_STAGES, TIERS, PRIORITIES, PriorityLevel } from '@/types/database';
import { useUpdateClub, useDeleteClub } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Instagram, Globe, Phone, Mail, MapPin, Trash2, Save, ExternalLink, Users } from 'lucide-react';

interface ClubInfoTabProps {
  club: Club;
  onClose: () => void;
}

export function ClubInfoTab({ club, onClose }: ClubInfoTabProps) {
  const [formData, setFormData] = useState({
    club_name: club.club_name,
    instagram_handle: club.instagram_handle || '',
    website: club.website || '',
    whatsapp: club.whatsapp || '',
    email: club.email || '',
    city: club.city || '',
    country: club.country || '',
    address: club.address || '',
    number_of_courts: club.number_of_courts || '',
    contact_name: club.contact_name || '',
    ownership_group: club.ownership_group || '',
    pipeline_stage: club.pipeline_stage || 'not_contacted',
    tier: club.tier || '',
    priority: club.priority || 'medium',
    notes: club.notes || '',
    next_action: club.next_action || '',
  });

  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();

  const handleSave = () => {
    updateClub.mutate({
      id: club.id,
      ...formData,
      number_of_courts: formData.number_of_courts ? Number(formData.number_of_courts) : null,
      tier: formData.tier || null,
    });
  };

  const handleDelete = () => {
    deleteClub.mutate(club.id);
    onClose();
  };

  const instagramUrl = formData.instagram_handle 
    ? `https://instagram.com/${formData.instagram_handle.replace('@', '')}`
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Club Name</Label>
          <Input 
            value={formData.club_name}
            onChange={(e) => setFormData(prev => ({ ...prev, club_name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Contact Name</Label>
          <Input 
            value={formData.contact_name}
            onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Users className="w-4 h-4" /> Ownership Group
        </Label>
        <Input 
          value={formData.ownership_group}
          onChange={(e) => setFormData(prev => ({ ...prev, ownership_group: e.target.value }))}
          placeholder="e.g. Africa Padel"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Instagram className="w-4 h-4" /> Instagram
          </Label>
          <div className="flex gap-2">
            <Input 
              value={formData.instagram_handle}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
              placeholder="@handle"
            />
            {instagramUrl && (
              <Button variant="outline" size="icon" asChild>
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> Website
          </Label>
          <Input 
            value={formData.website}
            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
            placeholder="https://"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> WhatsApp
          </Label>
          <Input 
            value={formData.whatsapp}
            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="+27..."
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email
          </Label>
          <Input 
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> City
          </Label>
          <Input 
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input 
            value={formData.country}
            onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Courts</Label>
          <Input 
            type="number"
            value={formData.number_of_courts}
            onChange={(e) => setFormData(prev => ({ ...prev, number_of_courts: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <Input 
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Pipeline Stage</Label>
          <Select 
            value={formData.pipeline_stage} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, pipeline_stage: value as typeof prev.pipeline_stage }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map(stage => (
                <SelectItem key={stage} value={stage}>
                  {stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Tier</Label>
          <Select 
            value={formData.tier} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value as typeof prev.tier }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select tier" />
            </SelectTrigger>
            <SelectContent>
              {TIERS.map(tier => (
                <SelectItem key={tier} value={tier}>
                  {tier.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select 
            value={formData.priority} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as typeof prev.priority }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Next Action</Label>
        <Input 
          value={formData.next_action}
          onChange={(e) => setFormData(prev => ({ ...prev, next_action: e.target.value }))}
          placeholder="What's the next step?"
        />
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea 
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="flex justify-between pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Club
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {club.club_name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this club and all related activities, tasks, and content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleSave} disabled={updateClub.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {updateClub.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
