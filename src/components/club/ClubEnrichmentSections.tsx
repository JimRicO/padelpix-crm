import { ExternalLink, Info, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Club } from '@/types/database';

interface ClubEnrichmentSectionsProps {
  club: Club;
}

export function ClubEnrichmentSections({ club }: ClubEnrichmentSectionsProps) {
  const hasEnrichmentData = club.enrichment_status === 'completed' && (
    club.color_palette || 
    club.fonts || 
    club.attitude || 
    club.aesthetics ||
    club.founder_info ||
    club.founding_year ||
    club.perplexity_description
  );

  if (!hasEnrichmentData) {
    return null;
  }

  const colorPalette = club.color_palette;
  const fonts = club.fonts;

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
