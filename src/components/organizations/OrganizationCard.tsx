import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Building2, Globe, Mail, MapPin, Sparkles, Loader2, Instagram, Check, Phone, User } from 'lucide-react';
import { useStartEnrichment } from '@/hooks/useEnrichmentStatus';
import type { OwnershipGroup } from '@/hooks/useOwnershipGroups';

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

export function OrganizationCard({ group, clubCount, onClick }: OrganizationCardProps) {
  const startEnrichment = useStartEnrichment();
  const status = group.relationship_status || 'active';
  const enrichmentStatus = group.enrichment_status;
  const isEnriching = startEnrichment.isPending || enrichmentStatus === 'pending' || enrichmentStatus === 'processing';

  const colorPalette = group.color_palette as Record<string, string> | null;

  const handleEnrich = async (e: React.MouseEvent) => {
    e.stopPropagation();
    startEnrichment.mutate({
      groupId: group.id,
      name: group.name,
      website: group.website || undefined,
      instagramHandle: group.instagram_handle || undefined,
    });
  };

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Card 
      className="cursor-pointer border-l-4"
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
              <Crown 
                className="w-5 h-5" 
                style={{ color: group.brand_color || 'hsl(var(--primary))' }}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            {/* Header: Name, Status, Enrich Button */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="card-title">{group.name}</h3>
              <Badge variant="outline" className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
              {enrichmentStatus && ENRICHMENT_STATUS_DISPLAY[enrichmentStatus] && (
                <Badge variant="outline" className={ENRICHMENT_STATUS_DISPLAY[enrichmentStatus].className}>
                  <Sparkles className="w-3 h-3 mr-1" />
                  {ENRICHMENT_STATUS_DISPLAY[enrichmentStatus].label}
                </Badge>
              )}
              <div className="ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnrich}
                  disabled={isEnriching || enrichmentStatus === 'completed'}
                  className="h-7 text-xs"
                >
                  {isEnriching ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : enrichmentStatus === 'completed' ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  {enrichmentStatus === 'completed' ? 'Enriched' : 'Enrich'}
                </Button>
              </div>
            </div>

            {/* Club count, country, founding year */}
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
            </div>

            {/* Address */}
            {group.address && (
              <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="card-icon-sm mt-0.5 shrink-0" />
                <span className="line-clamp-1">{group.address}</span>
              </div>
            )}

            {/* Contact: Email, Phone, Website */}
            {(group.contact_name || group.contact_email || group.contact_phone || group.website) && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                {group.contact_name && (
                  <span>{group.contact_name}</span>
                )}
                {group.contact_email && (
                  <span className="card-meta">
                    <Mail className="card-icon-sm" />
                    {group.contact_email}
                  </span>
                )}
                {group.contact_phone && (
                  <span className="card-meta">
                    <Phone className="card-icon-sm" />
                    {group.contact_phone}
                  </span>
                )}
                {group.website && (
                  <span className="card-meta">
                    <Globe className="card-icon-sm" />
                    {new URL(group.website).hostname}
                  </span>
                )}
              </div>
            )}

            {/* Instagram & Bio */}
            {group.instagram_handle && (
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Instagram className="card-icon-sm" />
                  <span>@{group.instagram_handle.replace('@', '')}</span>
                  {group.instagram_followers && (
                    <span className="font-medium">{formatFollowers(group.instagram_followers)} followers</span>
                  )}
                </div>
                {group.instagram_bio && (
                  <p className="text-xs text-muted-foreground italic line-clamp-2 pl-5">
                    "{group.instagram_bio}"
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {group.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {group.description}
              </p>
            )}

            {/* Founder Info */}
            {group.founder_info && (
              <div className="flex items-start gap-1 text-xs text-muted-foreground mt-2">
                <User className="card-icon-sm mt-0.5 shrink-0" />
                <span className="line-clamp-2">{group.founder_info}</span>
              </div>
            )}

            {/* Color Palette */}
            {colorPalette && Object.keys(colorPalette).length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-muted-foreground">Colors:</span>
                <div className="flex gap-1 flex-wrap">
                  {Object.entries(colorPalette).map(([name, color]) => 
                    color && (
                      <div 
                        key={name}
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color }}
                        title={name.charAt(0).toUpperCase() + name.slice(1)}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Attitude/Aesthetics tags */}
            {(group.attitude || group.aesthetics) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {group.attitude && (
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    {group.attitude}
                  </Badge>
                )}
                {group.aesthetics && (
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    {group.aesthetics}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
