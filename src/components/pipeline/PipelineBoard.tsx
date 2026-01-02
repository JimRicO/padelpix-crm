import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useClubs, useUpdateClubStage } from '@/hooks/useClubs';
import { Club, PipelineStage, PIPELINE_STAGES } from '@/types/database';
import { ClubCard } from './ClubCard';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STAGE_CONFIG: Record<PipelineStage, { label: string; colorClass: string }> = {
  not_contacted: { label: 'Not Contacted', colorClass: 'bg-[hsl(var(--stage-not-contacted))]' },
  followed: { label: 'Followed', colorClass: 'bg-[hsl(var(--stage-followed))]' },
  engaged: { label: 'Engaged', colorClass: 'bg-[hsl(var(--stage-engaged))]' },
  dm_sent: { label: 'DM Sent', colorClass: 'bg-[hsl(var(--stage-dm-sent))]' },
  responded: { label: 'Responded', colorClass: 'bg-[hsl(var(--stage-responded))]' },
  content_created: { label: 'Content Created', colorClass: 'bg-[hsl(var(--stage-content-created))]' },
  trial: { label: 'Trial', colorClass: 'bg-[hsl(var(--stage-trial))]' },
  customer: { label: 'Customer', colorClass: 'bg-[hsl(var(--stage-customer))]' },
  dead: { label: 'Dead', colorClass: 'bg-[hsl(var(--stage-dead))]' },
};

interface PipelineBoardProps {
  onClubClick: (club: Club) => void;
  searchQuery: string;
}

export function PipelineBoard({ onClubClick, searchQuery }: PipelineBoardProps) {
  const { data: clubs, isLoading } = useClubs();
  const updateStage = useUpdateClubStage();

  const filteredClubs = useMemo(() => {
    if (!clubs) return [];
    if (!searchQuery.trim()) return clubs;
    
    const query = searchQuery.toLowerCase();
    return clubs.filter(club => 
      club.club_name.toLowerCase().includes(query) ||
      club.instagram_handle?.toLowerCase().includes(query) ||
      club.city?.toLowerCase().includes(query) ||
      club.country?.toLowerCase().includes(query)
    );
  }, [clubs, searchQuery]);

  const clubsByStage = useMemo(() => {
    const grouped: Record<PipelineStage, Club[]> = {
      not_contacted: [],
      followed: [],
      engaged: [],
      dm_sent: [],
      responded: [],
      content_created: [],
      trial: [],
      customer: [],
      dead: [],
    };

    filteredClubs.forEach(club => {
      const stage = club.pipeline_stage || 'not_contacted';
      grouped[stage].push(club);
    });

    return grouped;
  }, [filteredClubs]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStage = destination.droppableId as PipelineStage;

    updateStage.mutate({ id: draggableId, stage: newStage });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-pulse text-muted-foreground">Loading pipeline...</div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {PIPELINE_STAGES.map(stage => (
          <div key={stage} className="flex-shrink-0 w-72">
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('w-3 h-3 rounded-full', STAGE_CONFIG[stage].colorClass)} />
              <h3 className="font-semibold text-sm text-foreground">
                {STAGE_CONFIG[stage].label}
              </h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {clubsByStage[stage].length}
              </Badge>
            </div>
            
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    'pipeline-column space-y-3 min-h-[500px]',
                    snapshot.isDraggingOver && 'bg-accent/50 ring-2 ring-primary/20'
                  )}
                >
                  {clubsByStage[stage].map((club, index) => (
                    <Draggable key={club.id} draggableId={club.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ClubCard 
                            club={club} 
                            onClick={() => onClubClick(club)}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
