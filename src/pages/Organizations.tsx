import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOwnershipGroupsList, useSyncMissingOrganizations } from '@/hooks/useOwnershipGroups';
import { useClubs } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, LogOut, User, Building2, RefreshCw, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { AddOrganizationDialog } from '@/components/organizations/AddOrganizationDialog';
import { OwnershipGroupModal } from '@/components/group/OwnershipGroupModal';

export default function Organizations() {
  const { user, loading, signOut } = useAuth();
  const { data: groups = [], isLoading: groupsLoading } = useOwnershipGroupsList();
  const { data: clubs = [] } = useClubs();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'clubs' | 'courts'>('name');
  
  const syncMutation = useSyncMissingOrganizations();

  // Get unique ownership group names from clubs
  const uniqueClubGroups = useMemo(() => {
    const groupSet = new Set<string>();
    clubs.forEach(club => {
      if (club.ownership_group && club.ownership_group.trim()) {
        groupSet.add(club.ownership_group);
      }
    });
    return Array.from(groupSet);
  }, [clubs]);

  // Find missing organizations
  const missingOrgs = useMemo(() => {
    const existingNames = groups.map(g => g.name);
    return uniqueClubGroups.filter(name => !existingNames.includes(name));
  }, [uniqueClubGroups, groups]);

  const handleSync = () => {
    syncMutation.mutate(missingOrgs);
  };

  // Calculate club counts per group
  const clubCountByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    clubs.forEach(club => {
      if (club.ownership_group) {
        counts[club.ownership_group] = (counts[club.ownership_group] || 0) + 1;
      }
    });
    return counts;
  }, [clubs]);

  // Calculate total courts per group
  const courtsCountByGroup = useMemo(() => {
    const counts: Record<string, number> = {};
    clubs.forEach(club => {
      if (club.ownership_group && club.number_of_courts) {
        counts[club.ownership_group] = (counts[club.ownership_group] || 0) + club.number_of_courts;
      }
    });
    return counts;
  }, [clubs]);

  // Filter groups by search
  const filteredGroups = useMemo(() => {
    let result = groups;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.contact_name?.toLowerCase().includes(query) ||
        group.contact_email?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'clubs':
          return (clubCountByGroup[b.name] || 0) - (clubCountByGroup[a.name] || 0);
        case 'courts':
          return (courtsCountByGroup[b.name] || 0) - (courtsCountByGroup[a.name] || 0);
        default:
          return 0;
      }
    });
  }, [groups, searchQuery, sortBy, clubCountByGroup, courtsCountByGroup]);

  const getUserInitials = () => {
    const email = user?.email || '';
    return email.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">PadelPix</h1>
          <span className="text-sm text-muted-foreground">CRM</span>
          <div className="ml-4 flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Clubs</a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/people">People</a>
            </Button>
            <Button variant="secondary" size="sm">Organizations</Button>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search organizations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {missingOrgs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSync}
              disabled={syncMutation.isPending}
            >
              {syncMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Sync Missing
              <Badge variant="secondary" className="ml-2">
                {missingOrgs.length}
              </Badge>
            </Button>
          )}
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <User className="w-4 h-4" />
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive">
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {/* Sort controls */}
        {!groupsLoading && filteredGroups.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'clubs' | 'courts')}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="clubs">Most Clubs</SelectItem>
                <SelectItem value="courts">Most Courts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {groupsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">
              {searchQuery ? 'No organizations found' : 'No organizations yet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'Try adjusting your search query'
                : 'Organizations are automatically created when you assign clubs to ownership groups'}
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredGroups.map(group => (
              <OrganizationCard
                key={group.id}
                group={group}
                clubCount={clubCountByGroup[group.name] || 0}
                onClick={() => setSelectedGroup(group.name)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <AddOrganizationDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog} 
      />
      
      <OwnershipGroupModal
        groupName={selectedGroup}
        isOpen={!!selectedGroup}
        onClose={() => setSelectedGroup(null)}
        clubCount={selectedGroup ? clubCountByGroup[selectedGroup] || 0 : 0}
        totalCourts={selectedGroup ? courtsCountByGroup[selectedGroup] || 0 : 0}
      />
    </div>
  );
}
