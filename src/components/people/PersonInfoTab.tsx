import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarIcon, Upload, Link as LinkIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUpdatePerson, useDeletePerson } from '@/hooks/usePeople';
import { CONTACT_METHODS } from '@/types/people';
import type { Person } from '@/types/people';
import { MarkdownPreview } from '@/components/ui/markdown-renderer';

interface PersonInfoTabProps {
  person: Person;
  onClose: () => void;
}

export function PersonInfoTab({ person, onClose }: PersonInfoTabProps) {
  const updatePerson = useUpdatePerson();
  const deletePerson = useDeletePerson();

  const getInitialFormData = () => ({
    full_name: person.full_name,
    role: person.role || '',
    email: person.email || '',
    phone: person.phone || '',
    country: person.country || 'South Africa',
    instagram_handle: person.instagram_handle || '',
    linkedin: person.linkedin || '',
    notes: person.notes || '',
    profile_image: person.profile_image || '',
    contact_date: person.contact_date || '',
    contact_method: person.contact_method || '',
    contact_method_other: person.contact_method_other || '',
  });

  const [formData, setFormData] = useState(getInitialFormData);
  const [initialFormData, setInitialFormData] = useState(getInitialFormData);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const newFormData = getInitialFormData();
    setFormData(newFormData);
    setInitialFormData(newFormData);
  }, [person.id]);

  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${person.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      handleChange('profile_image', urlData.publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      handleChange('profile_image', imageUrl.trim());
      setImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleSave = async () => {
    await updatePerson.mutateAsync({
      id: person.id,
      full_name: formData.full_name,
      role: formData.role || null,
      email: formData.email || null,
      phone: formData.phone || null,
      country: formData.country || null,
      instagram_handle: formData.instagram_handle || null,
      linkedin: formData.linkedin || null,
      notes: formData.notes || null,
      profile_image: formData.profile_image || null,
      contact_date: formData.contact_date || null,
      contact_method: formData.contact_method || null,
      contact_method_other: formData.contact_method_other || null,
    }, {
      onSuccess: () => {
        setInitialFormData(formData);
      },
    });
  };

  const handleDelete = async () => {
    await deletePerson.mutateAsync(person.id);
    onClose();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Profile Image */}
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={formData.profile_image || undefined} alt={formData.full_name} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {getInitials(formData.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={uploading} asChild>
              <label className="cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              URL
            </Button>
          </div>
          {showUrlInput && (
            <div className="flex gap-2">
              <Input
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="h-8"
              />
              <Button size="sm" onClick={handleUrlSubmit}>
                Set
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="e.g., Owner, Manager, Coach"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input
            id="instagram"
            value={formData.instagram_handle}
            onChange={(e) => handleChange('instagram_handle', e.target.value)}
            placeholder="@handle"
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            value={formData.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-4">Contact Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Contact Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !formData.contact_date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.contact_date
                    ? format(new Date(formData.contact_date), 'PPP')
                    : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.contact_date ? new Date(formData.contact_date) : undefined}
                  onSelect={(date) =>
                    handleChange('contact_date', date ? date.toISOString() : '')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Contact Method</Label>
            <Select
              value={formData.contact_method}
              onValueChange={(value) => handleChange('contact_method', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {CONTACT_METHODS.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.contact_method === 'other' && (
            <div className="col-span-2 space-y-2">
              <Label htmlFor="contact_other">Specify Contact Method</Label>
              <Input
                id="contact_other"
                value={formData.contact_method_other}
                onChange={(e) => handleChange('contact_method_other', e.target.value)}
                placeholder="Enter contact method"
              />
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
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

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Person
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Person</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {person.full_name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={handleSave}
          disabled={!isDirty || updatePerson.isPending}
          className={cn(isDirty && 'bg-orange-500 hover:bg-orange-600')}
        >
          {updatePerson.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
