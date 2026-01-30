import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Shield } from 'lucide-react';
import { useCreateOwnershipGroup, ORGANIZATION_TYPES, type OrganizationType } from '@/hooks/useOwnershipGroups';
import { cn } from '@/lib/utils';

interface AddOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationCreated?: (organizationName: string) => void;
}

const RELATIONSHIP_STATUSES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
] as const;

const initialFormData = {
  name: '',
  organization_type: 'commercial' as OrganizationType,
  instagram_handle: '',
  website: '',
  country: 'South Africa',
  relationship_status: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  notes: '',
};

export function AddOrganizationDialog({ open, onOpenChange, onOrganizationCreated }: AddOrganizationDialogProps) {
  const [formData, setFormData] = useState(initialFormData);
  const createGroup = useCreateOwnershipGroup();

  const updateField = (field: keyof typeof formData, value: string) => {
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
    if (!formData.name.trim()) return;

    const result = await createGroup.mutateAsync({
      name: formData.name.trim(),
      organization_type: formData.organization_type,
      instagram_handle: formData.instagram_handle.trim() || null,
      website: formData.website.trim() || null,
      country: formData.country.trim() || 'South Africa',
      relationship_status: formData.relationship_status || null,
      contact_name: formData.contact_name.trim() || null,
      contact_email: formData.contact_email.trim() || null,
      contact_phone: formData.contact_phone.trim() || null,
      notes: formData.notes.trim() || null,
    });

    // Notify parent with the created organization name
    onOrganizationCreated?.(result.name);

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
          <DialogTitle>Add Organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Virgin Active"
              autoFocus
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="neu-pressed p-2 rounded-xl">
              <div className="grid grid-cols-2 gap-2">
                {ORGANIZATION_TYPES.map((type) => {
                  const isSelected = formData.organization_type === type.value;
                  const Icon = type.value === 'commercial' ? Crown : Shield;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => updateField('organization_type', type.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg transition-all duration-200 text-center",
                        isSelected 
                          ? "neu-subtle border-2 border-primary bg-primary/5" 
                          : "hover:bg-muted/50"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "w-5 h-5",
                          isSelected ? "text-primary" : "text-muted-foreground"
                        )} 
                      />
                      <span 
                        className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-primary" : "text-foreground"
                        )}
                      >
                        {type.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Instagram & Website */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) => updateField('instagram_handle', e.target.value)}
                placeholder="@handle"
              />
            </div>
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
          </div>

          {/* Country & Relationship Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => updateField('country', e.target.value)}
                placeholder="South Africa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship_status">Relationship Status</Label>
              <Select
                value={formData.relationship_status}
                onValueChange={(value) => updateField('relationship_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Name & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => updateField('contact_name', e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                placeholder="email@company.com"
              />
            </div>
          </div>

          {/* Contact Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                value={formData.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                placeholder="+27 82 123 4567"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim() || createGroup.isPending}>
              {createGroup.isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
