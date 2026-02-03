import { 
  ExternalLink, Instagram, Info, Sparkles, Users, Palette, Type, 
  Activity, Link2, ChevronDown, User, Globe, MapPin, Phone, Mail,
  Calendar, Building2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    <div className="neu-card space-y-4">
      {/* Header with Logo */}
      <div className="flex items-start gap-4">
        {club.logo ? (
          <div className="neu-pressed w-16 h-16 rounded-xl p-1 flex-shrink-0">
            <img 
              src={club.logo} 
              alt={club.club_name} 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        ) : (
          <div className="neu-pressed w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              AI-Enriched
            </span>
            {club.enriched_at && (
              <span className="text-xs text-muted-foreground">
                • {new Date(club.enriched_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mt-1">{club.club_name}</h3>
          {club.founding_year && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
              <Calendar className="w-3 h-3" />
              Est. {club.founding_year}
            </div>
          )}
          {club.website && (
            <a 
              href={club.website.startsWith('http') ? club.website : `https://${club.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
            >
              <Globe className="w-3 h-3" />
              {club.website.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
      </div>

      {/* Instagram Section */}
      {(club.instagram_handle || club.insta_followers || club.insta_bio) && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Instagram className="w-4 h-4" />
            Instagram
          </div>
          <div className="detail-section-content">
            <div className="flex items-center gap-3">
              {club.instagram_profile_pic_url ? (
                <Avatar className="w-10 h-10">
                  <AvatarImage src={club.instagram_profile_pic_url} alt="Profile" />
                  <AvatarFallback><Instagram className="w-5 h-5" /></AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                {club.instagram_handle && (
                  <a 
                    href={`https://instagram.com/${club.instagram_handle.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    @{club.instagram_handle.replace('@', '')}
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
              <p className="text-sm text-muted-foreground mt-2">{club.insta_bio}</p>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {(club.address || club.phone || club.email) && (
        <div className="detail-section">
          <div className="detail-section-header">
            <MapPin className="w-4 h-4" />
            Contact
          </div>
          <div className="detail-section-content space-y-2">
            {club.address && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{club.address}</span>
              </div>
            )}
            {club.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span>{club.phone}</span>
              </div>
            )}
            {club.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${club.email}`} className="text-primary hover:underline">
                  {club.email}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Color Palette */}
      {colorPalette && Object.keys(colorPalette).length > 0 && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Palette className="w-4 h-4" />
            Color Palette
          </div>
          <div className="flex gap-3 flex-wrap mt-2">
            {Object.entries(colorPalette).map(([name, color]) => 
              color && (
                <div key={name} className="color-swatch">
                  <div 
                    className="color-swatch-box neu-subtle" 
                    style={{ backgroundColor: color as string }}
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
      {fonts && Object.keys(fonts).length > 0 && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Type className="w-4 h-4" />
            Typography
          </div>
          <div className="flex gap-2 flex-wrap mt-2">
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
      {club.business_description && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Info className="w-4 h-4" />
            Description
          </div>
          <p className="text-sm text-muted-foreground mt-1">{club.business_description}</p>
        </div>
      )}

      {/* Attitude & Aesthetics */}
      {(club.attitude || club.aesthetics) && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Sparkles className="w-4 h-4" />
            Brand Identity
          </div>
          <div className="space-y-2 mt-1">
            {club.attitude && (
              <div>
                <span className="text-xs text-muted-foreground font-medium">Attitude</span>
                <p className="text-sm">{club.attitude}</p>
              </div>
            )}
            {club.aesthetics && (
              <div>
                <span className="text-xs text-muted-foreground font-medium">Aesthetics</span>
                <p className="text-sm">{club.aesthetics}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Research Summary */}
      {club.perplexity_description && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Sparkles className="w-4 h-4" />
            Research Summary
          </div>
          <p className="text-sm text-muted-foreground mt-1">{club.perplexity_description}</p>
        </div>
      )}

      {/* Founder & Background */}
      {(club.founder_info || club.founding_year) && (
        <div className="detail-section">
          <div className="detail-section-header">
            <User className="w-4 h-4" />
            Founder & Background
          </div>
          <div className="detail-section-content">
            {club.founding_year && !club.founder_info && (
              <p className="text-sm">Founded in {club.founding_year}</p>
            )}
            {club.founder_info && (
              <p className="text-sm text-muted-foreground">{club.founder_info}</p>
            )}
          </div>
        </div>
      )}

      {/* Key People */}
      {keyIndividuals && keyIndividuals.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Users className="w-4 h-4" />
            Key People
          </div>
          <div className="space-y-2 mt-2">
            {keyIndividuals.map((name, idx) => (
              <div key={idx} className="detail-section-content py-2">
                <p className="text-sm font-medium">{name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {recentActivities && recentActivities.length > 0 && (
        <div className="detail-section">
          <div className="detail-section-header">
            <Activity className="w-4 h-4" />
            Recent Activities
          </div>
          <div className="space-y-2 mt-2">
            {recentActivities.slice(0, 5).map((activity, i) => (
              <div key={i} className="detail-section-content py-2">
                {activity.title && <p className="text-sm font-medium">{activity.title}</p>}
                {activity.description && (
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
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
        <div className="detail-section">
          <button
            onClick={() => setCitationsOpen(!citationsOpen)}
            className="detail-section-header w-full justify-between hover:bg-muted/50 p-2 -m-2 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Sources ({club.perplexity_citations.length})
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${citationsOpen ? 'rotate-180' : ''}`} />
          </button>
          {citationsOpen && (
            <div className="space-y-1 mt-2 pl-6">
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
    </div>
  );
}
