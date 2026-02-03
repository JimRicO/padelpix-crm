import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreatePerson } from '@/hooks/usePeople';
import { useCreatePersonLink } from '@/hooks/usePersonLinks';
import { toast } from 'sonner';
import { User, Building2, Loader2 } from 'lucide-react';

interface KeyPerson {
  name: string;
  role: string;
  context?: string;
}

interface CreatePersonFromKeyPeopleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  keyPerson: KeyPerson;
  clubId: string;
  clubName: string;
}

interface FormData {
  full_name: string;
  role: string;
  email: string;
  linkedin: string;
  notes: string;
}

export function CreatePersonFromKeyPeopleDialog({
  open,
  onOpenChange,
  keyPerson,
  clubId,
  clubName,
}: CreatePersonFromKeyPeopleDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPerson = useCreatePerson();
  const createLink = useCreatePersonLink();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      full_name: keyPerson.name,
      role: keyPerson.role,
      email: '',
      linkedin: '',
      notes: keyPerson.context || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Create the person
      const newPerson = await createPerson.mutateAsync({
        full_name: data.full_name,
        role: data.role || null,
        email: data.email || null,
        linkedin: data.linkedin || null,
        notes: data.notes || null,
        country: 'South Africa',
      });

      // Step 2: Link the person to the club
      await createLink.mutateAsync({
        person_id: newPerson.id,
        link_type: 'club',
        club_id: clubId,
        role_at_entity: data.role || null,
        is_primary: true,
      });

      toast.success(`Created ${data.full_name} and linked to ${clubName}`);
      reset();
      onOpenChange(false);
    } catch (error) {
      // Error already handled by mutation hooks
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Create Person Record
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            Will be linked to {clubName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              {...register('full_name', { required: 'Name is required' })}
              placeholder="Enter full name"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              {...register('role')}
              placeholder="e.g., CEO, Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              {...register('linkedin')}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Background</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              rows={3}
              placeholder="Background information..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create & Link'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
