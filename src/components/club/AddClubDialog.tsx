import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateClub } from '@/hooks/useClubs';
import { TIERS, PRIORITIES, ClubTier, PriorityLevel } from '@/types/database';
import { Building2 } from 'lucide-react';

interface AddClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddClubDialog({ open, onOpenChange }: AddClubDialogProps) {
  const createClub = useCreateClub();
  const [formData, setFormData] = useState({
    club_name: '',
    instagram_handle: '',
    city: '',
    country: 'South Africa',
    website: '',
    whatsapp: '',
    email: '',
    number_of_courts: '',
    tier: '',
    priority: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createClub.mutate({
      club_name: formData.club_name,
      instagram_handle: formData.instagram_handle || undefined,
      city: formData.city || undefined,
      country: formData.country || undefined,
      website: formData.website || undefined,
      whatsapp: formData.whatsapp || undefined,
      email: formData.email || undefined,
      number_of_courts: formData.number_of_courts ? Number(formData.number_of_courts) : undefined,
      tier: formData.tier as 'group_owned' | 'large' | 'multi_court' | 'boutique' | undefined,
      priority: formData.priority as 'high' | 'medium' | 'low',
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          club_name: '',
          instagram_handle: '',
          city: '',
          country: 'South Africa',
          website: '',
          whatsapp: '',
          email: '',
          number_of_courts: '',
          tier: '',
          priority: 'medium',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Add New Club
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Club Name *</Label>
            <Input 
              value={formData.club_name}
              onChange={(e) => setFormData(prev => ({ ...prev, club_name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram Handle</Label>
              <Input 
                value={formData.instagram_handle}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram_handle: e.target.value }))}
                placeholder="@handle"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of Courts</Label>
              <Input 
                type="number"
                value={formData.number_of_courts}
                onChange={(e) => setFormData(prev => ({ ...prev, number_of_courts: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select 
                value={formData.tier} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tier: value }))}
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
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input 
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+27..."
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Website</Label>
            <Input 
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createClub.isPending}>
              {createClub.isPending ? 'Creating...' : 'Create Club'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
