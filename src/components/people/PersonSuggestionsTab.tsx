import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Building2, Users } from 'lucide-react';
import { usePersonLinkSuggestions, useUpdateSuggestionStatus, useCreatePersonLink } from '@/hooks/usePersonLinks';
import { useClubs } from '@/hooks/useClubs';
import type { Person } from '@/types/people';

interface PersonSuggestionsTabProps {
  person: Person;
}

export function PersonSuggestionsTab({ person }: PersonSuggestionsTabProps) {
  const { data: suggestions = [], isLoading } = usePersonLinkSuggestions(person.id);
  const { data: clubs = [] } = useClubs();
  const updateStatus = useUpdateSuggestionStatus();
  const createLink = useCreatePersonLink();

  const handleApprove = async (suggestion: typeof suggestions[0]) => {
    // Create the actual link
    await createLink.mutateAsync({
      person_id: person.id,
      link_type: suggestion.link_type as 'club' | 'ownership_group',
      club_id: suggestion.club_id,
      ownership_group_name: suggestion.ownership_group_name,
      is_primary: false,
    });

    // Update suggestion status
    await updateStatus.mutateAsync({
      id: suggestion.id,
      status: 'approved',
      personId: person.id,
    });
  };

  const handleReject = async (suggestion: typeof suggestions[0]) => {
    await updateStatus.mutateAsync({
      id: suggestion.id,
      status: 'rejected',
      personId: person.id,
    });
  };

  const getClubName = (clubId: string | null) => {
    if (!clubId) return 'Unknown Club';
    const club = clubs.find((c) => c.id === clubId);
    return club?.club_name || 'Unknown Club';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading suggestions...</div>;
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No pending link suggestions. Suggestions appear when we find potential matches based on email domains or contact names.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Suggested Links</h3>
        <Badge variant="secondary">{suggestions.length} pending</Badge>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 rounded-lg border bg-card space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {suggestion.link_type === 'club' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Users className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-medium">
                    {suggestion.link_type === 'club'
                      ? getClubName(suggestion.club_id)
                      : suggestion.ownership_group_name}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.link_type === 'club' ? 'Club' : 'Ownership Group'}
                  </p>
                </div>
              </div>
            </div>

            {suggestion.match_reason && (
              <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {suggestion.match_reason}
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleReject(suggestion)}
                disabled={updateStatus.isPending}
              >
                <X className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => handleApprove(suggestion)}
                disabled={updateStatus.isPending || createLink.isPending}
              >
                <Check className="w-4 h-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
