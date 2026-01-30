import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PersonInfoTab } from './PersonInfoTab';
import { PersonLinksTab } from './PersonLinksTab';
import { PersonSuggestionsTab } from './PersonSuggestionsTab';
import { PersonResearchTab } from './PersonResearchTab';
import { usePersonLinkSuggestions } from '@/hooks/usePersonLinks';
import type { Person } from '@/types/people';

interface PersonDetailModalProps {
  person: Person | null;
  onClose: () => void;
}

export function PersonDetailModal({ person, onClose }: PersonDetailModalProps) {
  const { data: suggestions = [] } = usePersonLinkSuggestions(person?.id);
  const pendingCount = suggestions.length;

  if (!person) return null;

  return (
    <Dialog open={!!person} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{person.full_name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="links">Organizations</TabsTrigger>
            <TabsTrigger value="suggestions" className="relative">
              Suggestions
              {pendingCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4">
            <PersonInfoTab person={person} onClose={onClose} />
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <PersonLinksTab person={person} />
          </TabsContent>

          <TabsContent value="suggestions" className="mt-4">
            <PersonSuggestionsTab person={person} />
          </TabsContent>

          <TabsContent value="research" className="mt-4">
            <PersonResearchTab person={person} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
