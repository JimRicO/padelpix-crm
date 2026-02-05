import { useState } from 'react';
import { Club, PIPELINE_STAGES, TIERS, PRIORITIES, PriorityLevel } from '@/types/database';
import { useUpdateClub, useDeleteClub, useOwnershipGroups } from '@/hooks/useClubs';
import { useStartClubEnrichment } from '@/hooks/useClubEnrichment';
import { usePushToPadelpix } from '@/hooks/usePushToPadelpix';
import { useAnalyzeVisualDna } from '@/hooks/useAnalyzeVisualDna';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Instagram, Globe, Phone, Mail, MapPin, Trash2, Save, ExternalLink, Users, Check, ChevronsUpDown, Linkedin, Upload, X, Link, Facebook, Twitter, Heart, MessageCircle, Video, Hash, Sparkles, Loader2, Send, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MarkdownPreview } from '@/components/ui/markdown-renderer';
import { ClubEnrichmentSections } from './ClubEnrichmentSections';
import { VisualDnaCard } from './VisualDnaCard';

interface ClubInfoTabProps {
  club: Club;
  onClose: () => void;
}

export function ClubInfoTab({ club, onClose }: ClubInfoTabProps) {
  const getInitialFormData = () => ({
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
    // New fields
    phone: club.phone || '',
    business_description: club.business_description || '',
    google_maps_url: club.google_maps_url || '',
    facebook: club.facebook || '',
    twitter: club.twitter || '',
    insta_url: club.insta_url || '',
    insta_bio: club.insta_bio || '',
    insta_followers: club.insta_followers || '',
    avg_likes: club.avg_likes || '',
    avg_comments: club.avg_comments || '',
    avg_video_views: club.avg_video_views || '',
    top_hashtags: club.top_hashtags?.join(', ') || '',
    key_individuals: club.key_individuals?.join(', ') || '',
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [initialFormData, setInitialFormData] = useState(getInitialFormData);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  const updateClub = useUpdateClub();
  const deleteClub = useDeleteClub();
  const startEnrichment = useStartClubEnrichment();
  const pushToPadelpix = usePushToPadelpix();
  const analyzeVisualDna = useAnalyzeVisualDna();
  const { data: ownershipGroups = [] } = useOwnershipGroups();
  const [ownershipOpen, setOwnershipOpen] = useState(false);
  const [showPushConfirm, setShowPushConfirm] = useState(false);

  const isEnriching = club.enrichment_status === 'pending' || club.enrichment_status === 'processing';
  const isEnriched = club.enrichment_status === 'completed';
  const isPushedToPadelpix = !!club.pushed_to_padelpix_at;
  const isVisualDnaAnalyzed = !!club.visual_dna_analyzed_at;
  const canAnalyzeVisualDna = isEnriched && !!club.instagram_handle;
  
  // Club is pushable if it has enrichment data (at minimum club_name and instagram_handle)
  const canPushToPadelpix = club.club_name && (club.instagram_handle || club.website);

  const handlePushToPadelpix = () => {
    setShowPushConfirm(false);
    pushToPadelpix.mutate(club.id);
  };

  const handleEnrich = () => {
    startEnrichment.mutate({
      clubId: club.id,
      name: club.club_name,
      website: club.website || undefined,
      instagramHandle: club.instagram_handle || undefined,
    });
  };

  const handleAnalyzeVisualDna = () => {
    analyzeVisualDna.mutate(club.id);
  };

  // Check if form has unsaved changes
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

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
    setLogoUrl('');
    setShowUrlInput(false);
  };

  const handleUrlSubmit = () => {
    if (logoUrl.trim()) {
      setFormData(prev => ({ ...prev, logo: logoUrl.trim() }));
      setShowUrlInput(false);
    }
  };

  const handleSave = () => {
    updateClub.mutate({
      id: club.id,
      ...formData,
      number_of_courts: formData.number_of_courts ? Number(formData.number_of_courts) : null,
      tier: formData.tier || null,
      insta_followers: formData.insta_followers ? Number(formData.insta_followers) : null,
      avg_likes: formData.avg_likes ? Number(formData.avg_likes) : null,
      avg_comments: formData.avg_comments ? Number(formData.avg_comments) : null,
      avg_video_views: formData.avg_video_views ? Number(formData.avg_video_views) : null,
      top_hashtags: formData.top_hashtags ? formData.top_hashtags.split(',').map(t => t.trim()).filter(Boolean) : null,
      key_individuals: formData.key_individuals ? formData.key_individuals.split(',').map(t => t.trim()).filter(Boolean) : null,
    }, {
      onSuccess: () => {
        setInitialFormData(formData);
      }
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
          <div className="flex flex-col gap-2">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowUrlInput(!showUrlInput)}
              >
                <Link className="w-4 h-4 mr-2" />
                URL
              </Button>
              {formData.logo && (
                <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
            {showUrlInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleUrlSubmit} disabled={!logoUrl.trim()}>
                  <Check className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Info</h3>
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
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Social Media</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Instagram className="w-4 h-4" /> Instagram Handle
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
              <Instagram className="w-4 h-4" /> Instagram URL
            </Label>
            <Input 
              value={formData.insta_url}
              onChange={(e) => setFormData(prev => ({ ...prev, insta_url: e.target.value }))}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Facebook className="w-4 h-4" /> Facebook
            </Label>
            <Input 
              value={formData.facebook}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Twitter className="w-4 h-4" /> Twitter/X
            </Label>
            <Input 
              value={formData.twitter}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
              placeholder="@handle or URL"
            />
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
      </div>

      {/* Instagram Metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Instagram Metrics</h3>
        <div className="space-y-2">
          <Label>Instagram Bio</Label>
          <Textarea 
            value={formData.insta_bio}
            onChange={(e) => setFormData(prev => ({ ...prev, insta_bio: e.target.value }))}
            rows={2}
            placeholder="Bio text from Instagram profile"
          />
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Followers
            </Label>
            <Input 
              type="number"
              value={formData.insta_followers}
              onChange={(e) => setFormData(prev => ({ ...prev, insta_followers: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Avg Likes
            </Label>
            <Input 
              type="number"
              value={formData.avg_likes}
              onChange={(e) => setFormData(prev => ({ ...prev, avg_likes: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Avg Comments
            </Label>
            <Input 
              type="number"
              value={formData.avg_comments}
              onChange={(e) => setFormData(prev => ({ ...prev, avg_comments: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="w-4 h-4" /> Avg Video Views
            </Label>
            <Input 
              type="number"
              value={formData.avg_video_views}
              onChange={(e) => setFormData(prev => ({ ...prev, avg_video_views: e.target.value }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Hash className="w-4 h-4" /> Top Hashtags
          </Label>
          <Input 
            value={formData.top_hashtags}
            onChange={(e) => setFormData(prev => ({ ...prev, top_hashtags: e.target.value }))}
            placeholder="padel, tennis, sports (comma-separated)"
          />
        </div>
      </div>

      {/* Location & Contact */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Location & Contact</h3>
        <div className="space-y-2">
          <Label>Address</Label>
          <Input 
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
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
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Google Maps URL
          </Label>
          <Input 
            value={formData.google_maps_url}
            onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
            placeholder="https://maps.google.com/..."
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone
            </Label>
            <Input 
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+27..."
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
      </div>

      {/* Business */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Business</h3>
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
        </div>
        <div className="space-y-2">
          <Label>Business Description</Label>
          <Textarea 
            value={formData.business_description}
            onChange={(e) => setFormData(prev => ({ ...prev, business_description: e.target.value }))}
            rows={3}
            placeholder="Description of the club's business..."
          />
        </div>
      </div>

      {/* Key People */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Key People</h3>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Key Individuals
          </Label>
          <Input 
            value={formData.key_individuals}
            onChange={(e) => setFormData(prev => ({ ...prev, key_individuals: e.target.value }))}
            placeholder="John Doe, Jane Smith (comma-separated)"
          />
        </div>
      </div>

      {/* Pipeline Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pipeline Settings</h3>
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
      </div>

      {/* AI Enrichment Data */}
      <ClubEnrichmentSections club={club} clubId={club.id} clubName={club.club_name} />

      {/* Visual DNA Card */}
      <VisualDnaCard club={club} />

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Notes & Actions</h3>
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
            placeholder="Supports **markdown** formatting..."
          />
          {formData.notes && (
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Preview:</span>
              <MarkdownPreview content={formData.notes} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <div className="flex gap-2">
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
        </div>

        <div className="flex gap-2">
          {/* Enrichment Button - Step 1 */}
          {isEnriching ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enriching...
            </Button>
          ) : isEnriched ? (
            <Button variant="outline" size="sm" onClick={handleEnrich} disabled={startEnrichment.isPending}>
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Re-enrich
              <Badge variant="secondary" className="ml-2 text-xs">Done</Badge>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEnrich}
              disabled={startEnrichment.isPending}
            >
              {startEnrichment.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Enrich
            </Button>
          )}

          {/* Analyze Visual DNA Button - Step 2 */}
          {canAnalyzeVisualDna && (
            isVisualDnaAnalyzed ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-cyan-500" />
                  <span>DNA {format(new Date(club.visual_dna_analyzed_at!), 'MMM d')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeVisualDna}
                  disabled={analyzeVisualDna.isPending}
                  className="border-cyan-500/30 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950"
                >
                  {analyzeVisualDna.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Re-analyze
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeVisualDna}
                disabled={analyzeVisualDna.isPending}
                className="border-cyan-500/30 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950"
              >
                {analyzeVisualDna.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing... (30-60s)
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Analyze Visual DNA
                  </>
                )}
              </Button>
            )
          )}

          {/* Push to PadelPix Button - Step 3 */}
          {canPushToPadelpix && isEnriched && (
            <>
              {isPushedToPadelpix ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Check className="w-3 h-3 text-success" />
                    <span>Pushed {format(new Date(club.pushed_to_padelpix_at!), 'MMM d')}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPushConfirm(true)}
                    disabled={pushToPadelpix.isPending}
                    className="text-primary border-primary/30 hover:bg-accent hover:text-accent-foreground"
                  >
                    {pushToPadelpix.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Re-sync
                  </Button>
                </div>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowPushConfirm(true)}
                  disabled={pushToPadelpix.isPending}
                >
                  {pushToPadelpix.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Push to PadelPix
                </Button>
              )}
              
              {/* Push Confirmation Dialog */}
              <AlertDialog open={showPushConfirm} onOpenChange={setShowPushConfirm}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isPushedToPadelpix ? 'Re-sync' : 'Push'} {club.club_name} to PadelPix?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {isPushedToPadelpix 
                        ? 'This will update the existing club profile in PadelPix with the latest data.'
                        : 'This will create a club profile in PadelPix ready for content generation.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handlePushToPadelpix}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isPushedToPadelpix ? 'Re-sync' : 'Push to PadelPix'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}

          <Button 
            onClick={handleSave} 
            disabled={updateClub.isPending || !hasChanges}
            className={hasChanges && !updateClub.isPending ? 'bg-primary hover:bg-primary/90' : ''}
            variant={hasChanges && !updateClub.isPending ? 'default' : 'secondary'}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateClub.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
