import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClub } from '@/hooks/useClubs';
import { Header } from '@/components/layout/Header';
import { PipelineBoard } from '@/components/pipeline/PipelineBoard';
import { ClubDetailModal } from '@/components/club/ClubDetailModal';
import { AddClubDialog } from '@/components/club/AddClubDialog';
import { ImportDialog } from '@/components/import/ImportDialog';
import { Club } from '@/types/database';

export default function Index() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedClubSnapshot, setSelectedClubSnapshot] = useState<Club | null>(null);
  const { data: selectedClubFresh } = useClub(selectedClubId);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddClub={() => setShowAddDialog(true)}
        onImport={() => setShowImportDialog(true)}
      />
      
      <main className="flex-1 p-6 overflow-hidden">
        <PipelineBoard 
          onClubClick={(club) => {
            setSelectedClubId(club.id);
            setSelectedClubSnapshot(club);
          }}
          searchQuery={searchQuery}
        />
      </main>

      <ClubDetailModal 
        club={selectedClubFresh ?? selectedClubSnapshot}
        open={!!selectedClubId}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedClubId(null);
            setSelectedClubSnapshot(null);
          }
        }}
      />

      <AddClubDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <ImportDialog 
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
    </div>
  );
}
