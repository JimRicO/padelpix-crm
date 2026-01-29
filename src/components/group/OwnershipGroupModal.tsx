import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useOwnershipGroupByName, useUpsertOwnershipGroup } from '@/hooks/useOwnershipGroups';
import { Crown, Building2, Mail, Phone, Globe, Palette, Loader2, Upload, Link, X, Check, MapPin, Settings, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrganizationDetailView } from './OrganizationDetailView';

interface OwnershipGroupModalProps {
  groupName: string | null;
  isOpen: boolean;
  onClose: () => void;
  clubCount?: number;
  totalCourts?: number;
}

const RELATIONSHIP_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'prospecting', label: 'Prospecting' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'partner', label: 'Partner' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'inactive', label: 'Inactive' },
];

export function OwnershipGroupModal({ 
  groupName, 
  isOpen, 
  onClose,
  clubCount = 0,
  totalCourts = 0,
}: OwnershipGroupModalProps) {
  const { data: existingGroup, isLoading } = useOwnershipGroupByName(groupName);
  const upsertMutation = useUpsertOwnershipGroup();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    logo_url: '',
    brand_color: '#6366f1',
    website: '',
    relationship_status: 'active',
    total_clubs: null as number | null,
    country: 'South Africa',
  });
  const [initialFormData, setInitialFormData] = useState(formData);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  const hasEnrichmentData = existingGroup?.enrichment_status === 'completed';

  useEffect(() => {
    const newFormData = existingGroup
      ? {
          contact_name: existingGroup.contact_name || '',
          contact_email: existingGroup.contact_email || '',
          contact_phone: existingGroup.contact_phone || '',
          notes: existingGroup.notes || '',
          logo_url: existingGroup.logo_url || '',
          brand_color: existingGroup.brand_color || '#6366f1',
          website: existingGroup.website || '',
          relationship_status: existingGroup.relationship_status || 'active',
          total_clubs: existingGroup.total_clubs,
          country: existingGroup.country || 'South Africa',
        }
      : {
          contact_name: '',
          contact_email: '',
          contact_phone: '',
          notes: '',
          logo_url: '',
          brand_color: '#6366f1',
          website: '',
          relationship_status: 'active',
          total_clubs: null,
          country: 'South Africa',
        };
    setFormData(newFormData);
    setInitialFormData(newFormData);
  }, [existingGroup, groupName]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !groupName) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `group-${groupName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('club-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('club-logos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast({ title: 'Logo uploaded successfully' });
    } catch (error: any) {
      toast({ title: 'Failed to upload logo', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (logoUrl.trim()) {
      setFormData(prev => ({ ...prev, logo_url: logoUrl.trim() }));
      setShowUrlInput(false);
      setLogoUrl('');
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo_url: '' }));
    setLogoUrl('');
    setShowUrlInput(false);
  };

  const handleSave = async () => {
    if (!groupName) return;
    
    await upsertMutation.mutateAsync({
      name: groupName,
      ...formData,
    });
    setInitialFormData(formData);
    onClose();
  };

  if (!groupName) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            {groupName}
            {hasEnrichmentData && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Enriched
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="mx-4 mb-2">
              <TabsTrigger value="overview" className="gap-1">
                <Sparkles className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="flex-1 m-0 border-t">
              {existingGroup ? (
                <div className="h-[65vh]">
                  <OrganizationDetailView group={existingGroup} clubCount={clubCount} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available. Configure settings to get started.
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="flex-1 m-0 border-t">
              <ScrollArea className="h-[65vh]">
                <div className="p-4 space-y-6">
                  {/* Stats */}
                  <div className="flex items-center gap-4 p-4 neu-pressed rounded-lg">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formData.total_clubs 
                          ? `${clubCount} of ${formData.total_clubs} clubs imported`
                          : `${clubCount} clubs`}
                      </span>
                    </div>
                    {totalCourts > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{totalCourts} total courts</span>
                      </div>
                    )}
                  </div>

                  {/* Total Clubs */}
                  <div className="space-y-2">
                    <Label>Total Clubs Owned</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.total_clubs ?? ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        total_clubs: e.target.value ? parseInt(e.target.value, 10) : null 
                      }))}
                      placeholder={`${clubCount} (auto-calculated from imported clubs)`}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave blank to use the count of imported clubs, or enter the total if you know the group owns more.
                    </p>
                  </div>

                  {/* Logo & Branding */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Group Logo</Label>
                      <div className="flex items-center gap-3">
                        {formData.logo_url ? (
                          <img 
                            src={formData.logo_url} 
                            alt={groupName} 
                            className="w-16 h-16 object-contain rounded-lg border"
                          />
                        ) : (
                          <div className="w-16 h-16 neu-pressed rounded-lg flex items-center justify-center">
                            <Crown className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild disabled={isUploading}>
                              <label className="cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                {isUploading ? 'Uploading...' : 'Upload'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleLogoUpload}
                                  disabled={isUploading}
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
                            {formData.logo_url && (
                              <Button variant="ghost" size="sm" onClick={handleRemoveLogo}>
                                <X className="w-4 h-4" />
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

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Brand Color
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={formData.brand_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={formData.brand_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                          placeholder="#6366f1"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Contact Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input
                          value={formData.contact_name}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email
                        </Label>
                        <Input
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                          placeholder="contact@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Phone
                        </Label>
                        <Input
                          type="tel"
                          value={formData.contact_phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                          placeholder="+27 12 345 6789"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          Website
                        </Label>
                        <Input
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Country
                        </Label>
                        <Input
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="South Africa"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Relationship Status */}
                  <div className="space-y-2">
                    <Label>Relationship Status</Label>
                    <Select
                      value={formData.relationship_status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, relationship_status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {RELATIONSHIP_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add notes about the partnership, key contacts, or relationship history..."
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSave} 
                      disabled={upsertMutation.isPending || !hasChanges}
                      className={hasChanges && !upsertMutation.isPending ? 'bg-primary hover:bg-primary/90' : ''}
                      variant={hasChanges && !upsertMutation.isPending ? 'default' : 'secondary'}
                    >
                      {upsertMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
