import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Crown, Shield } from 'lucide-react';
import { useCreateOwnershipGroup, ORGANIZATION_TYPES, type OrganizationType } from '@/hooks/useOwnershipGroups';
import { cn } from '@/lib/utils';

interface AddOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddOrganizationDialog({ open, onOpenChange }: AddOrganizationDialogProps) {
  const [name, setName] = useState('');
  const [organizationType, setOrganizationType] = useState<OrganizationType>('commercial');
  const createGroup = useCreateOwnershipGroup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createGroup.mutateAsync({ 
      name: name.trim(),
      organization_type: organizationType,
    });
    setName('');
    setOrganizationType('commercial');
    onOpenChange(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setName('');
      setOrganizationType('commercial');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Organization</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Virgin Active"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <div className="neu-pressed p-2 rounded-xl">
              <div className="grid grid-cols-2 gap-2">
                {ORGANIZATION_TYPES.map((type) => {
                  const isSelected = organizationType === type.value;
                  const Icon = type.value === 'commercial' ? Crown : Shield;
                  
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setOrganizationType(type.value)}
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || createGroup.isPending}>
              {createGroup.isPending ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
