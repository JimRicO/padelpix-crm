import { ExternalLink, Instagram, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { OwnershipGroup } from '@/hooks/useOwnershipGroups';

interface EnrichmentSectionsProps {
  group: OwnershipGroup;
}

export function EnrichmentSections({ group }: EnrichmentSectionsProps) {
  const hasEnrichmentData = group.enrichment_status === 'completed' && (
    group.description || 
    group.instagram_handle || 
    group.color_palette || 
    group.perplexity_description
  );

  if (!hasEnrichmentData) {
    return null;
  }

  const colorPalette = group.color_palette as { primary?: string; secondary?: string; accent?: string; background?: string } | null;
  const fonts = group.fonts as { primary?: string; heading?: string } | null;
  const recentActivities = group.recent_activities as Array<{ title?: string; date?: string; description?: string }> | null;

  return (
    <>
      <Separator />
      
      {/* Enrichment Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>AI-Enriched Data</span>
        {group.enriched_at && (
          <span className="text-xs">
            • Updated {new Date(group.enriched_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Description */}
      {group.description && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Description</h4>
          <p className="text-sm text-muted-foreground">{group.description}</p>
        </div>
      )}

      {/* Social Media */}
      {(group.instagram_handle || group.instagram_followers || group.instagram_bio) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {group.instagram_handle && (
              <a 
                href={`https://instagram.com/${group.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                @{group.instagram_handle.replace('@', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {group.instagram_followers && (
              <p className="text-sm font-medium">
                {group.instagram_followers.toLocaleString()} followers
              </p>
            )}
            {group.instagram_bio && (
              <p className="text-sm text-muted-foreground">{group.instagram_bio}</p>
            )}
          </div>
        </div>
      )}

      {/* Brand Identity */}
      {(colorPalette || fonts || group.attitude || group.aesthetics) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Brand Identity</h4>
          <div className="space-y-3">
            {/* Color Palette */}
            {colorPalette && Object.keys(colorPalette).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Colors</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(colorPalette).map(([name, color]) => 
                    color && (
                      <div key={name} className="flex items-center gap-1">
                        <div 
                          className="w-6 h-6 rounded border" 
                          style={{ backgroundColor: color as string }}
                          title={name.charAt(0).toUpperCase() + name.slice(1)}
                        />
                        <span className="text-xs capitalize">{name}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Fonts */}
            {fonts && Object.keys(fonts).length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Typography</p>
                <div className="flex gap-2 flex-wrap">
                  {fonts.heading && (
                    <Badge variant="outline" className="text-xs">
                      Heading: {fonts.heading}
                    </Badge>
                  )}
                  {fonts.primary && (
                    <Badge variant="outline" className="text-xs">
                      Body: {fonts.primary}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Attitude & Aesthetics */}
            {(group.attitude || group.aesthetics) && (
              <div className="flex gap-2 flex-wrap">
                {group.attitude && (
                  <Badge variant="secondary">{group.attitude}</Badge>
                )}
                {group.aesthetics && (
                  <Badge variant="secondary">{group.aesthetics}</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company History */}
      {(group.founder_info || group.founding_year) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">History</h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {group.founding_year && (
              <p className="text-sm">
                <span className="text-muted-foreground">Founded:</span> {group.founding_year}
              </p>
            )}
            {group.founder_info && (
              <p className="text-sm text-muted-foreground">{group.founder_info}</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Recent Activities</h4>
          <div className="space-y-2">
            {recentActivities.slice(0, 3).map((activity, i) => (
              <div key={i} className="bg-muted/50 rounded p-2 text-sm">
                {activity.title && <p className="font-medium">{activity.title}</p>}
                {activity.description && (
                  <p className="text-muted-foreground text-xs">{activity.description}</p>
                )}
                {activity.date && (
                  <p className="text-xs text-muted-foreground mt-1">{activity.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perplexity Research */}
      {group.perplexity_description && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Research Summary
          </h4>
          <p className="text-sm text-muted-foreground">{group.perplexity_description}</p>
          
          {/* Citations */}
          {group.perplexity_citations && group.perplexity_citations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sources:</p>
              <div className="flex flex-wrap gap-1">
                {group.perplexity_citations.slice(0, 5).map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    [{i + 1}]
                    <ExternalLink className="w-2 h-2" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
