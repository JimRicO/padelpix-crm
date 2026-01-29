import { 
  Building2, 
  Globe, 
  Instagram, 
  Phone, 
  Palette, 
  Type, 
  MessageSquare, 
  Sparkles, 
  Eye, 
  User, 
  Calendar, 
  Activity, 
  Link2, 
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { OwnershipGroup } from '@/hooks/useOwnershipGroups';

interface OrganizationDetailViewProps {
  group: OwnershipGroup;
  clubCount: number;
}

export function OrganizationDetailView({ group, clubCount }: OrganizationDetailViewProps) {
  const colorPalette = group.color_palette as Record<string, string> | null;
  const fonts = group.fonts as { primary?: string; heading?: string; list?: string[] } | null;
  const recentActivities = group.recent_activities as Array<{ title?: string; date?: string; description?: string }> | null;

  const formatFollowers = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toLocaleString();
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-start gap-4">
          {group.logo_url ? (
            <img 
              src={group.logo_url} 
              alt={group.name} 
              className="w-20 h-20 object-contain rounded-xl border bg-white"
            />
          ) : (
            <div 
              className="w-20 h-20 rounded-xl flex items-center justify-center neu-pressed"
              style={{ backgroundColor: `${group.brand_color || 'hsl(var(--primary))'}15` }}
            >
              <Building2 
                className="w-8 h-8" 
                style={{ color: group.brand_color || 'hsl(var(--primary))' }}
              />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {group.founding_year && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Est. {group.founding_year}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {group.total_clubs 
                  ? `${clubCount} of ${group.total_clubs} clubs`
                  : `${clubCount} clubs`}
              </span>
            </div>
            {group.website && (
              <a 
                href={group.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
              >
                <Globe className="w-4 h-4" />
                {group.website}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Phone Number - Standalone Card */}
        {group.contact_phone && (
          <div className="flex items-center gap-3 p-4 rounded-xl neu-pressed">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-base font-medium text-foreground">{group.contact_phone}</span>
          </div>
        )}

        {/* Color Palette */}
        {colorPalette && Object.keys(colorPalette).length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Palette className="w-4 h-4 text-primary" />
              Color Palette
            </h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(colorPalette).map(([name, color]) => 
                color && (
                  <div key={name} className="color-swatch">
                    <div 
                      className="color-swatch-box"
                      style={{ backgroundColor: color }}
                      title={`${name}: ${color}`}
                    />
                    <span className="color-swatch-label">{name}</span>
                    <span className="color-swatch-value">{color}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Typography */}
        {fonts && (fonts.primary || fonts.heading) && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Type className="w-4 h-4 text-primary" />
              Typography
            </h3>
            <div className="flex gap-3 flex-wrap">
              {fonts.primary && (
                <Badge variant="outline" className="text-xs">
                  Primary: {fonts.primary}
                </Badge>
              )}
              {fonts.heading && (
                <Badge variant="outline" className="text-xs">
                  Heading: {fonts.heading}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {group.description && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <MessageSquare className="w-4 h-4 text-primary" />
              Description
            </h3>
            <div className="detail-section-content">
              <p className="text-sm text-foreground leading-relaxed">
                {group.description}
              </p>
            </div>
          </div>
        )}

        {/* Founder Info */}
        {group.founder_info && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <User className="w-4 h-4 text-primary" />
              Founder
            </h3>
            <div className="detail-section-content">
              <p className="text-sm text-foreground leading-relaxed">{group.founder_info}</p>
            </div>
          </div>
        )}

        {/* Attitude - Separate Section */}
        {group.attitude && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Sparkles className="w-4 h-4 text-primary" />
              Attitude
            </h3>
            <div className="detail-section-content">
              <p className="text-sm text-foreground leading-relaxed">{group.attitude}</p>
            </div>
          </div>
        )}

        {/* Aesthetics - Separate Section */}
        {group.aesthetics && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Eye className="w-4 h-4 text-primary" />
              Aesthetics
            </h3>
            <div className="detail-section-content">
              <p className="text-sm text-foreground leading-relaxed">{group.aesthetics}</p>
            </div>
          </div>
        )}

        {/* Instagram Card */}
        {group.instagram_handle && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Instagram className="w-4 h-4 text-primary" />
              Instagram
            </h3>
            <div className="detail-section-content">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${group.brand_color || 'hsl(var(--primary))'}20` }}
                >
                  <Instagram 
                    className="w-6 h-6" 
                    style={{ color: group.brand_color || 'hsl(var(--primary))' }}
                  />
                </div>
                <div>
                  <a 
                    href={`https://instagram.com/${group.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    @{group.instagram_handle.replace('@', '')}
                  </a>
                  {group.instagram_followers && (
                    <p className="text-xs text-muted-foreground">
                      {formatFollowers(group.instagram_followers)} followers
                    </p>
                  )}
                </div>
              </div>
              {group.instagram_bio && (
                <p className="text-sm text-muted-foreground mt-3 italic">
                  "{group.instagram_bio}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Research Summary (Perplexity) */}
        {group.perplexity_description && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Sparkles className="w-4 h-4 text-primary" />
              Research Summary
            </h3>
            <div className="detail-section-content bg-primary/5">
              <p className="text-sm text-foreground leading-relaxed">
                {group.perplexity_description}
              </p>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        {recentActivities && recentActivities.length > 0 && (
          <div className="detail-section">
            <h3 className="detail-section-header">
              <Activity className="w-4 h-4 text-primary" />
              Recent Activities
            </h3>
            <div className="space-y-2">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg neu-subtle">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    {activity.title && (
                      <p className="text-sm font-medium text-foreground">{activity.title}</p>
                    )}
                    {activity.description && (
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    )}
                    {activity.date && (
                      <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Citations/Sources */}
        {group.perplexity_citations && group.perplexity_citations.length > 0 && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Link2 className="w-4 h-4" />
              Sources ({group.perplexity_citations.length})
              <ChevronDown className="w-4 h-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {group.perplexity_citations.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-primary hover:underline truncate"
                >
                  {url}
                </a>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </ScrollArea>
  );
}
