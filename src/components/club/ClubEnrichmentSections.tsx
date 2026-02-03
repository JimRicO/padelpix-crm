import { ExternalLink, Instagram, Info, Sparkles, Users, Palette, Type, Activity, Link2, ChevronDown, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import type { Club } from '@/types/database';

interface ClubEnrichmentSectionsProps {
  club: Club;
}

export function ClubEnrichmentSections({ club }: ClubEnrichmentSectionsProps) {
  const [citationsOpen, setCitationsOpen] = useState(false);

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
    club.recent_activities ||
    club.key_individuals
  );

  if (!hasEnrichmentData) {
    return null;
  }

  const colorPalette = club.color_palette;
  const fonts = club.fonts;
  const recentActivities = club.recent_activities;
  const keyIndividuals = club.key_individuals;

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
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Info className="w-4 h-4" />
            Description
          </h4>
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
            <div className="flex items-center gap-3">
              {club.instagram_profile_pic_url ? (
                <img 
                  src={club.instagram_profile_pic_url} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div>
                {club.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${club.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    @{club.instagram_handle.replace('@', '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {club.insta_followers && (
                  <p className="text-xs text-muted-foreground">
                    {club.insta_followers.toLocaleString()} followers
                  </p>
                )}
              </div>
            </div>
            {club.insta_bio && (
              <p className="text-sm text-muted-foreground">{club.insta_bio}</p>
            )}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {colorPalette && Object.keys(colorPalette).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color Palette
          </h4>
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

      {/* Typography */}
      {fonts && Object.keys(fonts).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Type className="w-4 h-4" />
            Typography
          </h4>
          <div className="flex gap-2 flex-wrap">
            {fonts.heading && (
              <Badge variant="outline" className="text-xs">
                Heading: {fonts.heading}
              </Badge>
            )}
            {fonts.primary && (
              <Badge variant="outline" className="text-xs">
                Primary: {fonts.primary}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Attitude & Aesthetics */}
      {(club.attitude || club.aesthetics) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Brand Identity</h4>
          <div className="space-y-2">
            {club.attitude && (
              <div>
                <span className="text-xs text-muted-foreground">Attitude:</span>
                <p className="text-sm">{club.attitude}</p>
              </div>
            )}
            {club.aesthetics && (
              <div>
                <span className="text-xs text-muted-foreground">Aesthetics:</span>
                <p className="text-sm">{club.aesthetics}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Founder Info */}
      {(club.founder_info || club.founding_year) && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Founder & Background
          </h4>
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

      {/* Key People */}
      {keyIndividuals && keyIndividuals.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4" />
            Key People
          </h4>
          <div className="space-y-2">
            {keyIndividuals.map((name, idx) => (
              <div key={idx} className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Perplexity Research */}
      {club.perplexity_description && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Research Summary
          </h4>
          <p className="text-sm text-muted-foreground">{club.perplexity_description}</p>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recent Activities
          </h4>
          <div className="space-y-2">
            {recentActivities.slice(0, 5).map((activity, i) => (
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

      {/* Citations */}
      {club.perplexity_citations && club.perplexity_citations.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setCitationsOpen(!citationsOpen)}
            className="flex items-center gap-2 text-sm font-medium w-full hover:bg-muted/50 p-2 rounded-lg transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Sources ({club.perplexity_citations.length})
            <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${citationsOpen ? 'rotate-180' : ''}`} />
          </button>
          {citationsOpen && (
            <div className="space-y-1 pl-6">
              {club.perplexity_citations.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{url}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
