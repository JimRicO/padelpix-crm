import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOwnershipGroupsList, useSyncMissingOrganizations, type OrganizationType } from '@/hooks/useOwnershipGroups';
import { useClubs } from '@/hooks/useClubs';
import { useEnrichmentPolling } from '@/hooks/useEnrichmentStatus';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Building2, RefreshCw, ArrowUpDown, Filter } from 'lucide-react';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import { AddOrganizationDialog } from '@/components/organizations/AddOrganizationDialog';
import { OwnershipGroupModal } from '@/components/group/OwnershipGroupModal';

type TypeFilter = 'all' | OrganizationType;

export default function Organizations() {
  const { user, loading } = useAuth();
  const { data: groups = [], isLoading: groupsLoading } = useOwnershipGroupsList();
  const { data: clubs = [] } = useClubs();
  
  // Enable polling for pending enrichments
  useEnrichmentPolling(groups);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'clubs' | 'country'>('name');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Get unique countries for filter dropdown
  const uniqueCountries = useMemo(() => {
    const countries = [...new Set(groups.map(g => g.country || 'South Africa').filter(Boolean))];
    return countries.sort((a, b) => a.localeCompare(b));
  }, [groups]);
  
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

  // Filter groups by search, type and country
  const filteredGroups = useMemo(() => {
    let result = groups;
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(group => (group.organization_type || 'commercial') === typeFilter);
    }
    
    // Apply country filter
    if (countryFilter && countryFilter !== 'all') {
      result = result.filter(group => (group.country || 'South Africa') === countryFilter);
    }
    
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
        case 'country':
          return (a.country || 'South Africa').localeCompare(b.country || 'South Africa');
        default:
          return 0;
      }
    });
  }, [groups, searchQuery, sortBy, typeFilter, countryFilter, clubCountByGroup]);

  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return {
        title: 'No organizations found',
        description: 'Try adjusting your search query',
      };
    }
    if (typeFilter === 'association') {
      return {
        title: 'No non-commercial organizations yet',
        description: 'Add federations, governing bodies, or sports organizations',
      };
    }
    if (typeFilter === 'commercial') {
      return {
        title: 'No commercial organizations yet',
        description: 'Add club chains or ownership groups',
      };
    }
    return {
      title: 'No organizations yet',
      description: 'Organizations are automatically created when you assign clubs to ownership groups',
    };
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

  const emptyState = getEmptyStateMessage();

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search organizations..."
        actions={
          <>
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
          </>
        }
      />

      {/* Content */}
      <main className="p-6">
        {/* Filter and Sort controls */}
        {!groupsLoading && groups.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />

            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Country:</span>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TypeFilter)}>
                <SelectTrigger className="w-[150px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="association">Association</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'clubs' | 'country')}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="clubs">Most Clubs</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {groupsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-medium mb-2">{emptyState.title}</h2>
            <p className="text-muted-foreground mb-4">{emptyState.description}</p>
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
