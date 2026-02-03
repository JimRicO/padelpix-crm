import { ExternalLink, Instagram, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Club } from '@/types/database';

interface ClubEnrichmentSectionsProps {
  club: Club;
}

export function ClubEnrichmentSections({ club }: ClubEnrichmentSectionsProps) {
  const hasEnrichmentData = club.enrichment_status === 'completed' && (
    club.business_description || 
    club.instagram_handle || 
    club.insta_followers ||
    club.color_palette || 
    club.fonts || 
    club.attitude || 
    club.aesthetics ||
    club.founder_info ||
    club.founding_year ||
    club.perplexity_description ||
    club.recent_activities
  );

  if (!hasEnrichmentData) {
    return null;
  }

  const colorPalette = club.color_palette;
  const fonts = club.fonts;
  const recentActivities = club.recent_activities;

  return (
    <>
      <Separator />
      
      {/* Enrichment Header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>AI-Enriched Data</span>
        {club.enriched_at && (
          <span className="text-xs">
            • Updated {new Date(club.enriched_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Description */}
      {club.business_description && (
        <div className="space-y-1">
          <h4 className="text-sm font-medium">Description</h4>
          <p className="text-sm text-muted-foreground">{club.business_description}</p>
        </div>
      )}

      {/* Instagram */}
      {(club.instagram_handle || club.insta_followers || club.insta_bio) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Instagram className="w-4 h-4" />
            Instagram
          </h4>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {club.instagram_handle && (
              <a 
                href={`https://instagram.com/${club.instagram_handle.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                @{club.instagram_handle.replace('@', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {club.insta_followers && (
              <p className="text-sm font-medium">
                {club.insta_followers.toLocaleString()} followers
              </p>
            )}
            {club.insta_bio && (
              <p className="text-sm text-muted-foreground">{club.insta_bio}</p>
            )}
          </div>
        </div>
      )}

      {/* Brand Identity */}
      {(colorPalette || fonts || club.attitude || club.aesthetics) && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Brand Identity</h3>
          <div className="space-y-3">
            {/* Color Palette */}
            {colorPalette && Object.keys(colorPalette).length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Colors</p>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(colorPalette).map(([name, color]) => 
                    color && (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <div 
                          className="w-12 h-12 rounded-lg shadow-neu-sm border" 
                          style={{ backgroundColor: color as string }}
                          title={name.charAt(0).toUpperCase() + name.slice(1)}
                        />
                        <span className="text-xs capitalize text-muted-foreground">{name}</span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground/70">{color}</span>
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
            {(club.attitude || club.aesthetics) && (
              <div className="flex gap-2 flex-wrap">
                {club.attitude && (
                  <Badge variant="secondary">{club.attitude}</Badge>
                )}
                {club.aesthetics && (
                  <Badge variant="secondary">{club.aesthetics}</Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company History */}
      {(club.founder_info || club.founding_year) && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">History</h3>
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            {club.founding_year && (
              <p className="text-sm">
                <span className="text-muted-foreground">Founded:</span> {club.founding_year}
              </p>
            )}
            {club.founder_info && (
              <p className="text-sm text-muted-foreground">{club.founder_info}</p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Recent Activities</h3>
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
      {club.perplexity_description && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Info className="w-4 h-4" />
            Research Summary
          </h3>
          <p className="text-sm text-muted-foreground">{club.perplexity_description}</p>
          
          {/* Citations */}
          {club.perplexity_citations && club.perplexity_citations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Sources:</p>
              <div className="flex flex-wrap gap-1">
                {club.perplexity_citations.slice(0, 5).map((url, i) => (
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
