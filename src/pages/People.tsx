import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePeople } from '@/hooks/usePeople';
import { usePersonLinks, usePersonLinkSuggestions } from '@/hooks/usePersonLinks';
import { PageHeader } from '@/components/layout/PageHeader';
import { PersonCard } from '@/components/people/PersonCard';
import { AddPersonDialog } from '@/components/people/AddPersonDialog';
import { PersonDetailModal } from '@/components/people/PersonDetailModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, ArrowUpDown, Filter } from 'lucide-react';
import type { Person } from '@/types/people';

export default function People() {
  const { user, loading: authLoading } = useAuth();
  const { data: people = [], isLoading } = usePeople();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'country' | 'role'>('name');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  // Get unique countries for filter dropdown
  const uniqueCountries = useMemo(() => {
    const countries = [...new Set(people.map(p => p.country || 'South Africa').filter(Boolean))];
    return countries.sort((a, b) => a.localeCompare(b));
  }, [people]);

  const filteredPeople = useMemo(() => {
    let result = people;
    
    // Apply country filter
    if (countryFilter && countryFilter !== 'all') {
      result = result.filter(person => (person.country || 'South Africa') === countryFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (person) =>
          person.full_name.toLowerCase().includes(query) ||
          person.email?.toLowerCase().includes(query) ||
          person.role?.toLowerCase().includes(query) ||
          person.country?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'country':
          return (a.country || 'South Africa').localeCompare(b.country || 'South Africa');
        case 'role':
          return (a.role || '').localeCompare(b.role || '');
        default:
          return 0;
      }
    });
  }, [people, searchQuery, sortBy, countryFilter]);

  if (authLoading) {
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
      <PageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search people..."
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        }
      />

      <main className="p-6">
        {/* Filter and Sort controls */}
        {!isLoading && people.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            {/* Country Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
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

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as 'name' | 'country' | 'role')}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="country">Country</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">
              {searchQuery ? 'No people found' : 'No people yet'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Add your first contact to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPeople.map((person) => (
              <PersonCardWithCounts
                key={person.id}
                person={person}
                onClick={() => setSelectedPerson(person)}
              />
            ))}
          </div>
        )}
      </main>

      <AddPersonDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <PersonDetailModal
        person={selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />
    </div>
  );
}

// Separate component to handle individual person's link/suggestion counts
function PersonCardWithCounts({
  person,
  onClick,
}: {
  person: Person;
  onClick: () => void;
}) {
  const { data: links = [] } = usePersonLinks(person.id);
  const { data: suggestions = [] } = usePersonLinkSuggestions(person.id);

  return (
    <PersonCard
      person={person}
      onClick={onClick}
      linksCount={links.length}
      suggestionsCount={suggestions.length}
    />
  );
}
