import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Club } from '@/types/database';
import { ClubInfoTab } from './ClubInfoTab';
import { ClubActivitiesTab } from './ClubActivitiesTab';
import { ClubTasksTab } from './ClubTasksTab';
import { ClubContentTab } from './ClubContentTab';
import { Building2, Activity, CheckSquare, Image } from 'lucide-react';

interface ClubDetailModalProps {
  club: Club | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClubDetailModal({ club, open, onOpenChange }: ClubDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  if (!club) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {club.club_name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="gap-2">
              <Building2 className="w-4 h-4" />
              Info
            </TabsTrigger>
            <TabsTrigger value="activities" className="gap-2">
              <Activity className="w-4 h-4" />
              Activities
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2">
              <Image className="w-4 h-4" />
              Content
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="info" className="mt-0 h-full">
              <ClubInfoTab club={club} onClose={() => onOpenChange(false)} />
            </TabsContent>
            <TabsContent value="activities" className="mt-0 h-full">
              <ClubActivitiesTab clubId={club.id} />
            </TabsContent>
            <TabsContent value="tasks" className="mt-0 h-full">
              <ClubTasksTab clubId={club.id} club={club} />
            </TabsContent>
            <TabsContent value="content" className="mt-0 h-full">
              <ClubContentTab clubId={club.id} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
