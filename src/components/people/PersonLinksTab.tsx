import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Plus, Trash2, Building2, Star, Crown, Shield, Check, ChevronsUpDown } from 'lucide-react';
import { usePersonLinks, useCreatePersonLink, useDeletePersonLink } from '@/hooks/usePersonLinks';
import { useClubs } from '@/hooks/useClubs';
import { useOwnershipGroupsList } from '@/hooks/useOwnershipGroups';
import { cn } from '@/lib/utils';
import { ClubDetailModal } from '@/components/club/ClubDetailModal';
import { OwnershipGroupModal } from '@/components/group/OwnershipGroupModal';
import { AddOrganizationDialog } from '@/components/organizations/AddOrganizationDialog';
import type { Club } from '@/types/database';
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

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [linkType, setLinkType] = useState<'club' | 'ownership_group'>('club');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [roleAtEntity, setRoleAtEntity] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [clubOpen, setClubOpen] = useState(false);
  const [organizationOpen, setOrganizationOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);

  const handleAddLink = async () => {
    if (linkType === 'club' && !selectedClubId) return;
    if (linkType === 'ownership_group' && !selectedGroupName) return;

    await createLink.mutateAsync({
      person_id: person.id,
      link_type: linkType,
      club_id: linkType === 'club' ? selectedClubId : null,
      ownership_group_name: linkType === 'ownership_group' ? selectedGroupName : null,
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
    setClubOpen(false);
    setOrganizationOpen(false);
  };

  const handleOrganizationCreated = (organizationName: string) => {
    setSelectedGroupName(organizationName);
    setShowCreateOrgDialog(false);
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
                    <span 
                      className="font-medium cursor-pointer hover:underline hover:text-primary transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (link.link_type === 'club' && link.club_id) {
                          const club = clubs.find(c => c.id === link.club_id);
                          if (club) setSelectedClub(club);
                        } else if (link.ownership_group_name) {
                          setSelectedOrganization(link.ownership_group_name);
                        }
                      }}
                    >
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
                <Popover open={clubOpen} onOpenChange={setClubOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={clubOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedClubId
                        ? clubs.find((club) => club.id === selectedClubId)?.club_name
                        : "Search clubs..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Type to search..." />
                      <CommandList>
                        <CommandEmpty>No club found.</CommandEmpty>
                        <CommandGroup>
                          {clubs.map((club) => (
                            <CommandItem
                              key={club.id}
                              value={club.club_name}
                              onSelect={() => {
                                setSelectedClubId(club.id);
                                setClubOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedClubId === club.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                              {club.club_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Select Organization</Label>
                <Popover open={organizationOpen} onOpenChange={setOrganizationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={organizationOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedGroupName ? (
                        <span className="flex items-center gap-2">
                          {(() => {
                            const group = ownershipGroups.find(g => g.name === selectedGroupName);
                            return group?.organization_type === 'association' ? (
                              <Shield className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <Crown className="w-4 h-4 text-muted-foreground" />
                            );
                          })()}
                          {selectedGroupName}
                        </span>
                      ) : (
                        "Search organizations..."
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Type to search..." />
                      <CommandList>
                        <CommandEmpty>No organization found.</CommandEmpty>
                        <CommandGroup>
                          {ownershipGroups.map((group) => (
                            <CommandItem
                              key={group.id}
                              value={group.name}
                              onSelect={() => {
                                setSelectedGroupName(group.name);
                                setOrganizationOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedGroupName === group.name ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {group.organization_type === 'association' ? (
                                <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Crown className="mr-2 h-4 w-4 text-muted-foreground" />
                              )}
                              {group.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => {
                              setOrganizationOpen(false);
                              setShowCreateOrgDialog(true);
                            }}
                          >
                            <Plus className="mr-2 h-4 w-4 text-primary" />
                            <span className="text-primary">Create New Organization</span>
                          </CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
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
                  (linkType === 'club' && !selectedClubId) ||
                  (linkType === 'ownership_group' && !selectedGroupName)
                }
              >
                {createLink.isPending ? 'Adding...' : 'Add Link'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Club Detail Modal */}
      <ClubDetailModal
        club={selectedClub}
        open={!!selectedClub}
        onOpenChange={(open) => !open && setSelectedClub(null)}
      />

      {/* Organization Detail Modal */}
      <OwnershipGroupModal
        groupName={selectedOrganization}
        isOpen={!!selectedOrganization}
        onClose={() => setSelectedOrganization(null)}
      />

      {/* Create Organization Dialog */}
      <AddOrganizationDialog
        open={showCreateOrgDialog}
        onOpenChange={setShowCreateOrgDialog}
        onOrganizationCreated={handleOrganizationCreated}
      />
    </div>
  );
}
