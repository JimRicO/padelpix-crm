import { useState } from 'react';
import { Club, PIPELINE_STAGES, TIERS, PRIORITIES, PriorityLevel } from '@/types/database';
import { useUpdateClub, useDeleteClub, useOwnershipGroups } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Instagram, Globe, Phone, Mail, MapPin, Trash2, Save, ExternalLink, Users, Check, ChevronsUpDown, Linkedin, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ClubInfoTabProps {
  club: Club;
  onClose: () => void;
}

export function ClubInfoTab({ club, onClose }: ClubInfoTabProps) {
  const [formData, setFormData] = useState({
    club_name: club.club_name,
    instagram_handle: club.instagram_handle || '',
    linkedin: club.linkedin || '',
    logo: club.logo || '',
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
  const [uploading, setUploading] = useState(false);

  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();
  const { data: ownershipGroups = [] } = useOwnershipGroups();
  const [ownershipOpen, setOwnershipOpen] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${club.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-logos')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo: publicUrl }));
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

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
      {/* Logo Section */}
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={formData.logo} alt={formData.club_name} />
          <AvatarFallback className="text-xl">
            {formData.club_name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Label>Club Logo</Label>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
            </Button>
            {formData.logo && (
              <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                <X className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

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
        <Popover open={ownershipOpen} onOpenChange={setOwnershipOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={ownershipOpen}
              className="w-full justify-between font-normal"
            >
              {formData.ownership_group || "Select or type ownership..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-popover" align="start">
            <Command>
              <CommandInput 
                placeholder="Search or add new..." 
                value={formData.ownership_group}
                onValueChange={(value) => setFormData(prev => ({ ...prev, ownership_group: value }))}
              />
              <CommandList>
                <CommandEmpty>
                  <div className="p-2 text-sm text-muted-foreground">
                    Press enter to use "{formData.ownership_group}"
                  </div>
                </CommandEmpty>
                <CommandGroup>
                  {ownershipGroups.map((group) => (
                    <CommandItem
                      key={group}
                      value={group}
                      onSelect={() => {
                        setFormData(prev => ({ ...prev, ownership_group: group }));
                        setOwnershipOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.ownership_group === group ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {group}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
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
            <Linkedin className="w-4 h-4" /> LinkedIn
          </Label>
          <div className="flex gap-2">
            <Input 
              value={formData.linkedin}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
              placeholder="https://linkedin.com/company/..."
            />
            {formData.linkedin && (
              <Button variant="outline" size="icon" asChild>
                <a href={formData.linkedin} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
