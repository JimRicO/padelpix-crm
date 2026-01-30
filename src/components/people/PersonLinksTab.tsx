import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Building2, Users, Star, Crown, Shield } from 'lucide-react';
import { usePersonLinks, useCreatePersonLink, useDeletePersonLink } from '@/hooks/usePersonLinks';
import { useClubs } from '@/hooks/useClubs';
import { useOwnershipGroupsList, useCreateOwnershipGroup } from '@/hooks/useOwnershipGroups';

import type { Person } from '@/types/people';

interface PersonLinksTabProps {
  person: Person;
}

export function PersonLinksTab({ person }: PersonLinksTabProps) {
  const { data: links = [], isLoading } = usePersonLinks(person.id);
  const { data: clubs = [] } = useClubs();
  const { data: ownershipGroups = [] } = useOwnershipGroupsList();
  const createLink = useCreatePersonLink();
  const deleteLink = useDeletePersonLink();
  const createOwnershipGroup = useCreateOwnershipGroup();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [linkType, setLinkType] = useState<'club' | 'ownership_group'>('club');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [roleAtEntity, setRoleAtEntity] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const handleAddLink = async () => {
    if (linkType === 'club' && !selectedClubId) return;
    if (linkType === 'ownership_group' && !isCreatingNew && !selectedGroupName) return;
    if (linkType === 'ownership_group' && isCreatingNew && !newGroupName.trim()) return;

    let groupName = selectedGroupName;

    // Create new ownership group if needed
    if (linkType === 'ownership_group' && isCreatingNew) {
      const newGroup = await createOwnershipGroup.mutateAsync({ name: newGroupName.trim() });
      groupName = newGroup.name;
    }

    await createLink.mutateAsync({
      person_id: person.id,
      link_type: linkType,
      club_id: linkType === 'club' ? selectedClubId : null,
      ownership_group_name: linkType === 'ownership_group' ? groupName : null,
      role_at_entity: roleAtEntity || null,
      is_primary: isPrimary,
    });

    resetDialogState();
  };

  const resetDialogState = () => {
    setShowAddDialog(false);
    setSelectedClubId('');
    setSelectedGroupName('');
    setRoleAtEntity('');
    setIsPrimary(false);
    setIsCreatingNew(false);
    setNewGroupName('');
  };

  const handleGroupSelectionChange = (value: string) => {
    if (value === '__create_new__') {
      setIsCreatingNew(true);
      setSelectedGroupName('');
    } else {
      setIsCreatingNew(false);
      setSelectedGroupName(value);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    await deleteLink.mutateAsync({ id: linkId, personId: person.id });
  };

  const getClubName = (clubId: string | null) => {
    if (!clubId) return 'Unknown Club';
    const club = clubs.find((c) => c.id === clubId);
    return club?.club_name || 'Unknown Club';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading links...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Linked Organizations</h3>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No linked organizations yet. Add a link to connect this person to a club or ownership group.
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {link.link_type === 'club' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    (() => {
                      const group = ownershipGroups.find(g => g.name === link.ownership_group_name);
                      return group?.organization_type === 'association' ? (
                        <Shield className="w-4 h-4" />
                      ) : (
                        <Crown className="w-4 h-4" />
                      );
                    })()
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {link.link_type === 'club'
                        ? getClubName(link.club_id)
                        : link.ownership_group_name}
                    </span>
                    {link.is_primary && (
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Primary
                      </Badge>
                    )}
                  </div>
                  {link.role_at_entity && (
                    <span className="text-sm text-muted-foreground">
                      {link.role_at_entity}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveLink(link.id)}
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Link Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) resetDialogState();
        else setShowAddDialog(true);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Organization Link</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select value={linkType} onValueChange={(v) => setLinkType(v as 'club' | 'ownership_group')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="ownership_group">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {linkType === 'club' ? (
              <div className="space-y-2">
                <Label>Select Club</Label>
                <Select value={selectedClubId} onValueChange={setSelectedClubId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a club" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map((club) => (
                      <SelectItem key={club.id} value={club.id}>
                        {club.club_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : isCreatingNew ? (
              <div className="space-y-2">
                <Label>New Group Name</Label>
                <Input
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter new group name"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setNewGroupName('');
                  }}
                  className="text-muted-foreground"
                >
                  ← Back to select existing
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Organization</Label>
                <Select value={selectedGroupName} onValueChange={handleGroupSelectionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {ownershipGroups.map((group) => (
                      <SelectItem key={group.id} value={group.name}>
                        <span className="flex items-center gap-2">
                          {group.organization_type === 'association' ? (
                            <Shield className="w-3 h-3 text-muted-foreground" />
                          ) : (
                            <Crown className="w-3 h-3 text-muted-foreground" />
                          )}
                          {group.name}
                        </span>
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value="__create_new__">
                      <span className="flex items-center gap-2 text-primary">
                        <Plus className="w-4 h-4" />
                        Create New Organization
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Role at Organization</Label>
              <Input
                value={roleAtEntity}
                onChange={(e) => setRoleAtEntity(e.target.value)}
                placeholder="e.g., Owner, Manager, Coach"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={isPrimary}
                onChange={(e) => setIsPrimary(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="isPrimary" className="font-normal">
                This is the primary affiliation
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={resetDialogState}>
                Cancel
              </Button>
              <Button
                onClick={handleAddLink}
                disabled={
                  createLink.isPending ||
                  createOwnershipGroup.isPending ||
                  (linkType === 'club' && !selectedClubId) ||
                  (linkType === 'ownership_group' && !isCreatingNew && !selectedGroupName) ||
                  (linkType === 'ownership_group' && isCreatingNew && !newGroupName.trim())
                }
              >
                {createLink.isPending || createOwnershipGroup.isPending ? 'Adding...' : 'Add Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
