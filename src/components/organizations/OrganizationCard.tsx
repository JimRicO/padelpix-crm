import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Building2, Globe, Mail, MapPin } from 'lucide-react';
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

export function OrganizationCard({ group, clubCount, onClick }: OrganizationCardProps) {
  const status = group.relationship_status || 'active';

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
            <div className="flex items-center gap-2 mb-1">
              <h3 className="card-title">{group.name}</h3>
              <Badge variant="outline" className={STATUS_COLORS[status]}>
                {STATUS_LABELS[status]}
              </Badge>
            </div>

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
            </div>

            {(group.contact_name || group.contact_email || group.website) && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {group.contact_name && (
                  <span>{group.contact_name}</span>
                )}
                {group.contact_email && (
                  <span className="card-meta">
                    <Mail className="card-icon-sm" />
                    {group.contact_email}
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
