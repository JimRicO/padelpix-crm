import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Building2, MapPin, Sparkles, Loader2, Instagram, Check, Shield, Trash2, AlertCircle, Calendar, ChevronDown } from 'lucide-react';
import { useStartEnrichment } from '@/hooks/useEnrichmentStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useDeleteOwnershipGroup, useUpdateOwnershipGroup, type OwnershipGroup } from '@/hooks/useOwnershipGroups';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddOrganizationToAgendaDialog } from './AddOrganizationToAgendaDialog';

interface OrganizationCardProps {
  group: OwnershipGroup;
  clubCount: number;
  onClick: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
  prospecting: { label: 'Prospecting', className: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  negotiating: { label: 'Negotiating', className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  partner: { label: 'Partner', className: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  on_hold: { label: 'On Hold', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground border-muted' },
};

const STATUS_ORDER = ['prospecting', 'negotiating', 'active', 'partner', 'on_hold', 'inactive'];

const TYPE_CONFIG = {
  commercial: {
    icon: Crown,
    label: 'Commercial',
    badgeClass: 'bg-primary/10 text-primary',
  },
  association: {
    icon: Shield,
    label: 'Association',
    badgeClass: 'bg-slate-500/10 text-slate-600',
  },
};

export function OrganizationCard({ group, clubCount, onClick }: OrganizationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAgendaDialog, setShowAgendaDialog] = useState(false);
  const startEnrichment = useStartEnrichment();
  const updateGroup = useUpdateOwnershipGroup();
  const deleteGroup = useDeleteOwnershipGroup();
  const status = group.relationship_status || 'active';
  const enrichmentStatus = group.enrichment_status;
  const isEnriching = startEnrichment.isPending || enrichmentStatus === 'pending' || enrichmentStatus === 'processing';
  const canEnrich = !!(group.website || group.instagram_handle);
  const orgType = group.organization_type || 'commercial';
  const typeConfig = TYPE_CONFIG[orgType];
  const TypeIcon = typeConfig.icon;

  const handleEnrich = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEnrich) {
      toast.error('Cannot enrich', {
        description: 'Add a website or Instagram handle first to enable enrichment.',
      });
      return;
    }
    startEnrichment.mutate({
      groupId: group.id,
      name: group.name,
      website: group.website || undefined,
      instagramHandle: group.instagram_handle || undefined,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteGroup.mutate(group.id);
    setShowDeleteDialog(false);
  };

  const handleStatusChange = (newStatus: string) => {
    updateGroup.mutate({
      id: group.id,
      relationship_status: newStatus,
    });
  };

  const handleAgendaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowAgendaDialog(true);
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <Card 
      className="cursor-pointer border-l-4 hover:shadow-md transition-shadow"
      style={{ borderLeftColor: group.brand_color || 'hsl(var(--primary))' }}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {group.logo_url ? (
            <img 
              src={group.logo_url} 
              alt={group.name} 
              className="card-avatar object-contain border bg-white"
            />
          ) : (
            <div 
              className="card-avatar flex items-center justify-center"
              style={{ backgroundColor: `${group.brand_color || 'hsl(var(--primary))'}20` }}
            >
              <TypeIcon 
                className="w-5 h-5" 
                style={{ color: group.brand_color || 'hsl(var(--primary))' }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Header: Name, Status Dropdown, Type Badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="card-title">{group.name}</h3>
              
              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Badge 
                    variant="outline" 
                    className={`${statusConfig.className} cursor-pointer hover:opacity-80`}
                  >
                    {statusConfig.label}
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                  {STATUS_ORDER.map((s) => (
                    <DropdownMenuItem 
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={s === status ? 'bg-accent' : ''}
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_CONFIG[s].className.split(' ')[0]}`} />
                      {STATUS_CONFIG[s].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Badge variant="outline" className={typeConfig.badgeClass}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeConfig.label}
              </Badge>
              {enrichmentStatus === 'completed' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
              
              {/* Action Buttons */}
              <div className="ml-auto flex items-center gap-1">
                {/* Agenda Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAgendaClick}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    >
                      <Calendar className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add to Agenda</p>
                  </TooltipContent>
                </Tooltip>

                {/* Enrich Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEnrich}
                      disabled={isEnriching || enrichmentStatus === 'completed'}
                      className={`h-7 text-xs ${!canEnrich && enrichmentStatus !== 'completed' ? 'opacity-50' : ''}`}
                    >
                      {isEnriching ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : enrichmentStatus === 'completed' ? (
                        <Check className="w-3 h-3 mr-1" />
                      ) : !canEnrich ? (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Sparkles className="w-3 h-3 mr-1" />
                      )}
                      {enrichmentStatus === 'completed' ? 'Enriched' : 'Enrich'}
                    </Button>
                  </TooltipTrigger>
                  {!canEnrich && enrichmentStatus !== 'completed' && (
                    <TooltipContent>
                      <p>Add a website or Instagram handle first</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Compact meta row: clubs, country, year */}
            <div className="card-meta-row">
              <div className="card-meta">
                <Building2 className="card-icon-sm" />
                <span>
                  {group.total_clubs 
                    ? `${clubCount} of ${group.total_clubs} clubs`
                    : `${clubCount} clubs`}
                </span>
              </div>
              <div className="card-meta">
                <MapPin className="card-icon-sm" />
                <span>{group.country || 'South Africa'}</span>
              </div>
              {group.founding_year && (
                <div className="card-meta">
                  <span className="text-muted-foreground">Est. {group.founding_year}</span>
                </div>
              )}
              {group.instagram_handle && (
                <div className="card-meta">
                  <Instagram className="card-icon-sm" />
                  <span>@{group.instagram_handle.replace('@', '')}</span>
                  {group.instagram_followers && (
                    <span className="font-medium ml-1">{formatFollowers(group.instagram_followers)}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{group.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to Agenda Dialog */}
      <AddOrganizationToAgendaDialog
        open={showAgendaDialog}
        onOpenChange={setShowAgendaDialog}
        organizationName={group.name}
      />
    </Card>
  );
}
