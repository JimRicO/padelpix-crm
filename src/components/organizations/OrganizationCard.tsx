import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Building2, MapPin, Sparkles, Loader2, Instagram, Check, Shield, Trash2, AlertCircle } from 'lucide-react';
import { useStartEnrichment } from '@/hooks/useEnrichmentStatus';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useDeleteOwnershipGroup, type OwnershipGroup } from '@/hooks/useOwnershipGroups';
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

interface OrganizationCardProps {
  group: OwnershipGroup;
  clubCount: number;
  onClick: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600 border-green-500/20',
  prospecting: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  negotiating: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  partner: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  on_hold: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  inactive: 'bg-muted text-muted-foreground border-muted',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  prospecting: 'Prospecting',
  negotiating: 'Negotiating',
  partner: 'Partner',
  on_hold: 'On Hold',
  inactive: 'Inactive',
};

const ENRICHMENT_STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  pending: { label: 'Enriching...', className: 'bg-yellow-500/10 text-yellow-600' },
  processing: { label: 'Processing...', className: 'bg-blue-500/10 text-blue-600' },
  completed: { label: 'Enriched', className: 'bg-green-500/10 text-green-600' },
  failed: { label: 'Failed', className: 'bg-red-500/10 text-red-600' },
};

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
  const startEnrichment = useStartEnrichment();
  const deleteGroup = useDeleteOwnershipGroup();
  const status = group.relationship_status || 'active';
  const enrichmentStatus = group.enrichment_status;
  const isEnriching = startEnrichment.isPending || enrichmentStatus === 'pending' || enrichmentStatus === 'processing';
  const canEnrich = !!(group.website || group.instagram_handle);
  const orgType = group.organization_type || 'commercial';
  const typeConfig = TYPE_CONFIG[orgType];
  const TypeIcon = typeConfig.icon;

  const colorPalette = group.color_palette as Record<string, string> | null;

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

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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
            {/* Header: Name, Status, Type Badge */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="card-title">{group.name}</h3>
              <Badge variant="outline" className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
              <Badge variant="outline" className={typeConfig.badgeClass}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeConfig.label}
              </Badge>
              {enrichmentStatus === 'completed' && (
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  <Check className="w-3 h-3" />
                </Badge>
              )}
              <div className="ml-auto flex items-center gap-1">
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
    </Card>
  );
}
