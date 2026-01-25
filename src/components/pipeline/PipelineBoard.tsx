import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useClubs, useUpdateClubStage } from '@/hooks/useClubs';
import { useOwnershipGroupsList } from '@/hooks/useOwnershipGroups';
import { Club, PipelineStage, PIPELINE_STAGES } from '@/types/database';
import { ClubCard } from './ClubCard';
import { ClubCardCompact } from './ClubCardCompact';
import { EnterpriseGroupCard } from './EnterpriseGroupCard';
import { OwnershipGroupModal } from '@/components/group/OwnershipGroupModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Users, LayoutGrid } from 'lucide-react';
import { groupClubsByOwnership } from '@/utils/ownershipPatterns';

const STAGE_CONFIG: Record<PipelineStage, { label: string; colorClass: string }> = {
  not_contacted: { label: 'Not Contacted', colorClass: 'bg-[hsl(var(--stage-not-contacted))]' },
  followed: { label: 'Followed', colorClass: 'bg-[hsl(var(--stage-followed))]' },
  engaged: { label: 'Engaged (likes/comments)', colorClass: 'bg-[hsl(var(--stage-engaged))]' },
  dm_sent: { label: 'DM Sent', colorClass: 'bg-[hsl(var(--stage-dm-sent))]' },
  responded: { label: 'Responded', colorClass: 'bg-[hsl(var(--stage-responded))]' },
  content_created: { label: 'Content Created', colorClass: 'bg-[hsl(var(--stage-content-created))]' },
  trial: { label: 'Trial', colorClass: 'bg-[hsl(var(--stage-trial))]' },
  customer: { label: 'Customer', colorClass: 'bg-[hsl(var(--stage-customer))]' },
  dead: { label: 'Dead', colorClass: 'bg-[hsl(var(--stage-dead))]' },
};

function StageProgressIndicator({ 
  percentage, 
  colorClass 
}: { 
  percentage: number; 
  colorClass: string 
}) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium min-w-[32px]">
        {percentage}%
      </span>
    </div>
  );
}

interface PipelineBoardProps {
  onClubClick: (club: Club) => void;
  searchQuery: string;
}

export function PipelineBoard({ onClubClick, searchQuery }: PipelineBoardProps) {
  const { data: clubs, isLoading } = useClubs();
  const { data: ownershipGroupsData } = useOwnershipGroupsList();
  const updateStage = useUpdateClubStage();
  const [viewMode, setViewMode] = useState<'individual' | 'grouped'>('grouped');
  const [selectedGroupName, setSelectedGroupName] = useState<string | null>(null);

  // Create a map of ownership group data for quick lookup
  const ownershipGroupDataMap = useMemo(() => {
    const map = new Map<string, { total_clubs: number | null }>();
    ownershipGroupsData?.forEach(group => {
      map.set(group.name, { total_clubs: group.total_clubs });
    });
    return map;
  }, [ownershipGroupsData]);

  const handleGroupClick = (groupName: string) => {
    setSelectedGroupName(groupName);
  };

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

  const { groups: ownershipGroups, ungrouped: ungroupedClubs } = useMemo(() => {
    return groupClubsByOwnership(filteredClubs);
  }, [filteredClubs]);

  const selectedGroup = useMemo(() => {
    if (!selectedGroupName) return null;
    return ownershipGroups.find(g => g.name === selectedGroupName) || null;
  }, [selectedGroupName, ownershipGroups]);

  const clubsByStage = useMemo(() => {
    const grouped: Record<PipelineStage, { clubs: Club[]; groups: typeof ownershipGroups }> = {
      not_contacted: { clubs: [], groups: [] },
      followed: { clubs: [], groups: [] },
      engaged: { clubs: [], groups: [] },
      dm_sent: { clubs: [], groups: [] },
      responded: { clubs: [], groups: [] },
      content_created: { clubs: [], groups: [] },
      trial: { clubs: [], groups: [] },
      customer: { clubs: [], groups: [] },
      dead: { clubs: [], groups: [] },
    };

    // Add ungrouped clubs
    ungroupedClubs.forEach(club => {
      const stage = club.pipeline_stage || 'not_contacted';
      grouped[stage].clubs.push(club);
    });

    // Add ownership groups (they appear in all stages where they have clubs)
    ownershipGroups.forEach(group => {
      PIPELINE_STAGES.forEach(stage => {
        const hasClubsInStage = group.clubs.some(c => (c.pipeline_stage || 'not_contacted') === stage);
        if (hasClubsInStage) {
          grouped[stage].groups.push(group);
        }
      });
    });

    return grouped;
  }, [ungroupedClubs, ownershipGroups]);

  const getStageCount = (stage: PipelineStage) => {
    if (viewMode === 'grouped') {
      const groupClubsCount = clubsByStage[stage].groups.reduce((sum, g) => 
        sum + g.clubs.filter(c => (c.pipeline_stage || 'not_contacted') === stage).length, 0);
      return clubsByStage[stage].clubs.length + groupClubsCount;
    }
    return filteredClubs.filter(c => (c.pipeline_stage || 'not_contacted') === stage).length;
  };

  // Calculate completion percentages for gamification
  const stageCompletionPercentages = useMemo(() => {
    if (!clubs || clubs.length === 0) return {} as Record<PipelineStage, number>;
    
    const totalClubs = clubs.length;
    const percentages: Record<PipelineStage, number> = {} as Record<PipelineStage, number>;
    
    PIPELINE_STAGES.forEach((stage, stageIndex) => {
      // Count clubs at this stage or beyond (excluding 'dead')
      const clubsAtOrBeyond = clubs.filter(club => {
        const clubStageIndex = PIPELINE_STAGES.indexOf(club.pipeline_stage || 'not_contacted');
        // Don't count 'dead' clubs for progression metrics
        if (club.pipeline_stage === 'dead') return false;
        return clubStageIndex >= stageIndex;
      }).length;
      
      percentages[stage] = Math.round((clubsAtOrBeyond / totalClubs) * 100);
    });
    
    return percentages;
  }, [clubs]);

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
    <div className="space-y-3">
      {/* View toggle */}
      <div className="flex items-center gap-2">
        <Button
          variant={viewMode === 'grouped' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grouped')}
          className="gap-1.5"
        >
          <Users className="w-3.5 h-3.5" />
          Group View
        </Button>
        <Button
          variant={viewMode === 'individual' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('individual')}
          className="gap-1.5"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Individual
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage} className="flex-shrink-0 w-72">
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', STAGE_CONFIG[stage].colorClass)} />
                  <h3 className="font-semibold text-sm text-foreground">
                    {STAGE_CONFIG[stage].label}
                  </h3>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {getStageCount(stage)}
                  </Badge>
                </div>
                {/* Only show progress for actionable stages */}
                {stage !== 'not_contacted' && stage !== 'dead' && (
                  <StageProgressIndicator 
                    percentage={stageCompletionPercentages[stage] || 0}
                    colorClass={STAGE_CONFIG[stage].colorClass}
                  />
                )}
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
                    {/* Render enterprise group cards in grouped mode */}
                    {viewMode === 'grouped' && clubsByStage[stage].groups.map((group) => (
                      <EnterpriseGroupCard
                        key={group.name}
                        groupName={group.name}
                        clubs={group.clubs}
                        totalCourts={group.totalCourts}
                        totalDms={group.totalDms}
                        stageBreakdown={group.stageBreakdown}
                        onClubClick={onClubClick}
                        currentStage={stage}
                        onGroupClick={handleGroupClick}
                        totalClubsOverride={ownershipGroupDataMap.get(group.name)?.total_clubs}
                        isCompact={stage !== 'not_contacted'}
                      />
                    ))}

                    {/* Render individual club cards */}
                    {(viewMode === 'grouped' ? clubsByStage[stage].clubs : filteredClubs.filter(c => (c.pipeline_stage || 'not_contacted') === stage)).map((club, index) => (
                      <Draggable key={club.id} draggableId={club.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            {stage === 'not_contacted' ? (
                              <ClubCard 
                                club={club} 
                                onClick={() => onClubClick(club)}
                                isDragging={snapshot.isDragging}
                              />
                            ) : (
                              <ClubCardCompact 
                                club={club} 
                                onClick={() => onClubClick(club)}
                                isDragging={snapshot.isDragging}
                              />
                            )}
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

      {/* Ownership Group Modal */}
      <OwnershipGroupModal
        groupName={selectedGroupName}
        isOpen={!!selectedGroupName}
        onClose={() => setSelectedGroupName(null)}
        clubCount={selectedGroup?.clubs.length || 0}
        totalCourts={selectedGroup?.totalCourts || 0}
      />
    </div>
  );
}
