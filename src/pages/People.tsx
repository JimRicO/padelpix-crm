import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePeople } from '@/hooks/usePeople';
import { usePersonLinks, usePersonLinkSuggestions } from '@/hooks/usePersonLinks';
import { Header } from '@/components/layout/Header';
import { PersonCard } from '@/components/people/PersonCard';
import { AddPersonDialog } from '@/components/people/AddPersonDialog';
import { PersonDetailModal } from '@/components/people/PersonDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Users } from 'lucide-react';
import type { Person } from '@/types/people';

export default function People() {
  const { user, loading: authLoading } = useAuth();
  const { data: people = [], isLoading } = usePeople();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = useMemo(() => {
    if (!searchQuery) return people;
    const query = searchQuery.toLowerCase();
    return people.filter(
      (person) =>
        person.full_name.toLowerCase().includes(query) ||
        person.email?.toLowerCase().includes(query) ||
        person.role?.toLowerCase().includes(query) ||
        person.country?.toLowerCase().includes(query)
    );
  }, [people, searchQuery]);

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
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-primary">PadelPix</h1>
          <span className="text-sm text-muted-foreground">CRM</span>
          <div className="ml-4 flex gap-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Clubs</a>
            </Button>
            <Button variant="secondary" size="sm">
              People
            </Button>
          </div>
        </div>

        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Person
          </Button>
        </div>
      </header>

      <main className="p-6">
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
