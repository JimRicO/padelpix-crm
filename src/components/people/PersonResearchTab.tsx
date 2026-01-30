import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  RefreshCw, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Twitter, 
  Globe, 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  Newspaper,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  User,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useStartPersonResearch, usePersonResearchStatus, usePersonResearchResults, usePersonEnrichmentData, useSaveEnrichmentData, useSaveEnrichmentJobId } from '@/hooks/usePersonEnrichment';
import { usePersonLinks } from '@/hooks/usePersonLinks';
import { useClubs } from '@/hooks/useClubs';
import { useOwnershipGroupsList } from '@/hooks/useOwnershipGroups';
import type { Person, EnrichedPerson } from '@/types/people';

interface PersonResearchTabProps {
  person: Person;
}

export function PersonResearchTab({ person }: PersonResearchTabProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [editableContext, setEditableContext] = useState<string>('');

  const { mutate: startResearch, isPending: isStarting } = useStartPersonResearch();
  const { data: status } = usePersonResearchStatus(jobId, isPolling);
  const { data: freshEnrichedPerson, isLoading: isLoadingResults } = usePersonResearchResults(
    jobId,
    status?.is_complete ?? false
  );

  // Load existing enrichment data from database (including pending job)
  const { data: savedEnrichment, isLoading: isLoadingSaved } = usePersonEnrichmentData(person.id);
  const { mutate: saveEnrichmentData } = useSaveEnrichmentData();
  const { mutate: saveJobId } = useSaveEnrichmentJobId();

  // Use fresh data if available, otherwise use saved data
  const enrichedPerson = freshEnrichedPerson || savedEnrichment?.enrichmentData;

  // Resume polling if there's a pending job from the database
  useEffect(() => {
    if (savedEnrichment?.pendingJobId && savedEnrichment?.jobStatus === 'processing') {
      console.log('Resuming polling for pending job:', savedEnrichment.pendingJobId);
      setJobId(savedEnrichment.pendingJobId);
      setIsPolling(true);
    }
  }, [savedEnrichment?.pendingJobId, savedEnrichment?.jobStatus]);

  // Auto-save when fresh results are fetched
  useEffect(() => {
    if (freshEnrichedPerson && person.id) {
      saveEnrichmentData({ personId: person.id, enrichmentData: freshEnrichedPerson });
    }
  }, [freshEnrichedPerson, person.id, saveEnrichmentData]);

  // Get linked organizations for context
  const { data: links = [] } = usePersonLinks(person.id);
  const { data: clubs = [] } = useClubs();
  const { data: ownershipGroups = [] } = useOwnershipGroupsList();

  // Derive context from links - include all organizations and LinkedIn
  const getContext = () => {
    const contextParts: string[] = [];

    // Add role if available
    if (person.role) {
      contextParts.push(person.role);
    }

    // Add all linked organizations
    if (links.length > 0) {
      const orgDescriptions = links.map(link => {
        let orgName = '';
        let orgWebsite = '';
        
        if (link.link_type === 'club' && link.club_id) {
          const club = clubs.find(c => c.id === link.club_id);
          if (club) {
            orgName = club.club_name;
            orgWebsite = club.website || '';
          }
        } else if (link.link_type === 'ownership_group' && link.ownership_group_name) {
          const group = ownershipGroups.find(g => g.name === link.ownership_group_name);
          if (group) {
            orgName = group.name;
            orgWebsite = group.website || '';
          }
        }

        if (orgName) {
          const role = link.role_at_entity || 'works at';
          const websitePart = orgWebsite ? ` (${orgWebsite})` : '';
          return `${role} ${orgName}${websitePart}`;
        }
        return null;
      }).filter(Boolean);

      if (orgDescriptions.length > 0) {
        contextParts.push(orgDescriptions.join(', '));
      }
    }

    // Add LinkedIn if available
    if (person.linkedin) {
      contextParts.push(`LinkedIn: ${person.linkedin}`);
    }

    return contextParts.length > 0 ? contextParts.join('. ') : undefined;
  };

  const handleStartResearch = () => {
    startResearch(
      { personName: person.full_name, context: editableContext || undefined },
      {
        onSuccess: (data) => {
          if (data.job_id) {
            setJobId(data.job_id);
            setIsPolling(true);
            // Persist job ID to database so it survives navigation
            saveJobId({ personId: person.id, jobId: data.job_id });
          }
        },
      }
    );
  };

  // Initialize editable context with auto-generated context
  useEffect(() => {
    const autoContext = getContext();
    if (autoContext && !editableContext) {
      setEditableContext(autoContext);
    }
  }, [links, clubs, ownershipGroups, person]);

  const handleReResearch = () => {
    setJobId(null);
    setIsPolling(false);
    handleStartResearch();
  };

  // Stop polling when complete
  if (status?.is_complete && isPolling) {
    setIsPolling(false);
  }

  // Track last updated time when status changes
  useEffect(() => {
    if (status) {
      setLastUpdated(new Date());
    }
  }, [status]);

  // Helper to format relative time
  const getRelativeTime = (date: Date | null) => {
    if (!date) return 'never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getConfidenceColor = (score: string | null) => {
    switch (score) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Show loading state for saved data
  if (isLoadingSaved) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show results if available
  if (enrichedPerson) {
    const enrichedAt = savedEnrichment?.enrichedAt;
    
    return (
      <div className="space-y-4">
        {/* Last researched indicator */}
        {enrichedAt && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Last researched: {new Date(enrichedAt).toLocaleDateString()} at {new Date(enrichedAt).toLocaleTimeString()}</span>
          </div>
        )}
        
        {/* Header Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                {enrichedPerson.photo_url ? (
                  <AvatarImage src={enrichedPerson.photo_url} alt={enrichedPerson.person_name} />
                ) : null}
                <AvatarFallback className="text-lg">
                  {enrichedPerson.person_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{enrichedPerson.person_name}</h3>
                
                {(enrichedPerson.job_title || enrichedPerson.company) && (
                  <p className="text-muted-foreground">
                    {enrichedPerson.job_title}
                    {enrichedPerson.job_title && enrichedPerson.company && ' at '}
                    <span className="font-medium">{enrichedPerson.company}</span>
                  </p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                  {enrichedPerson.department && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" /> {enrichedPerson.department}
                    </span>
                  )}
                  {enrichedPerson.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {enrichedPerson.location}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={getConfidenceColor(enrichedPerson.confidence_score)}>
                  {enrichedPerson.confidence_score || 'Unknown'} confidence
                </Badge>
                <Button variant="outline" size="sm" onClick={handleReResearch} disabled={isStarting}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Re-research
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Summary */}
        {enrichedPerson.research_summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                📊 Research Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{enrichedPerson.research_summary}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {enrichedPerson.all_citations?.length || 0} sources verified
              </p>
            </CardContent>
          </Card>
        )}

        {/* Biography */}
        {enrichedPerson.biography && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" /> Biography
                {enrichedPerson.biography_source && (
                  <a href={enrichedPerson.biography_source} target="_blank" rel="noopener noreferrer" className="ml-auto">
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{enrichedPerson.biography}</p>
            </CardContent>
          </Card>
        )}

        {/* Contact & Social */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Contact Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" /> Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrichedPerson.email && (
                <div>
                  <a href={`mailto:${enrichedPerson.email}`} className="text-sm text-primary hover:underline">
                    {enrichedPerson.email}
                  </a>
                  {enrichedPerson.email_confidence && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({enrichedPerson.email_confidence.replace('_', ' ')})
                    </span>
                  )}
                </div>
              )}
              {enrichedPerson.phone && (
                <div>
                  <a href={`tel:${enrichedPerson.phone}`} className="text-sm flex items-center gap-1 hover:underline">
                    <Phone className="h-3 w-3" /> {enrichedPerson.phone}
                  </a>
                </div>
              )}
              {!enrichedPerson.email && !enrichedPerson.phone && (
                <p className="text-sm text-muted-foreground">No contact info found</p>
              )}
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" /> Social
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {enrichedPerson.linkedin_url && (
                <a href={enrichedPerson.linkedin_url} target="_blank" rel="noopener noreferrer" 
                   className="text-sm flex items-center gap-1 text-primary hover:underline">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </a>
              )}
              {enrichedPerson.twitter_handle && (
                <a href={`https://twitter.com/${enrichedPerson.twitter_handle.replace('@', '')}`} 
                   target="_blank" rel="noopener noreferrer"
                   className="text-sm flex items-center gap-1 text-primary hover:underline">
                  <Twitter className="h-3 w-3" /> {enrichedPerson.twitter_handle}
                </a>
              )}
              {enrichedPerson.website && (
                <a href={enrichedPerson.website} target="_blank" rel="noopener noreferrer"
                   className="text-sm flex items-center gap-1 text-primary hover:underline">
                  <Globe className="h-3 w-3" /> Website
                </a>
              )}
              {!enrichedPerson.linkedin_url && !enrichedPerson.twitter_handle && !enrichedPerson.website && (
                <p className="text-sm text-muted-foreground">No social links found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent News */}
        {enrichedPerson.recent_news && enrichedPerson.recent_news.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Newspaper className="h-4 w-4" /> Recent News
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrichedPerson.recent_news.map((news, idx) => (
                  <a key={idx} href={news.url} target="_blank" rel="noopener noreferrer"
                     className="block p-2 rounded-lg hover:bg-muted transition-colors">
                    <p className="text-sm font-medium">{news.headline}</p>
                    <p className="text-xs text-muted-foreground">
                      {news.source} • {news.date}
                    </p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales Insights */}
        {(enrichedPerson.communication_style || 
          (enrichedPerson.key_interests && enrichedPerson.key_interests.length > 0) ||
          (enrichedPerson.conversation_starters && enrichedPerson.conversation_starters.length > 0)) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Sales Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrichedPerson.communication_style && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Communication Style</h4>
                  <p className="text-sm">{enrichedPerson.communication_style}</p>
                </div>
              )}
              
              {enrichedPerson.key_interests && enrichedPerson.key_interests.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Key Interests</h4>
                  <div className="flex flex-wrap gap-1">
                    {enrichedPerson.key_interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {enrichedPerson.conversation_starters && enrichedPerson.conversation_starters.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Conversation Starters</h4>
                  <ul className="text-sm space-y-1">
                    {enrichedPerson.conversation_starters.map((starter, idx) => (
                      <li key={idx}>• {starter}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Career History */}
        {enrichedPerson.previous_roles && enrichedPerson.previous_roles.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> Career History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-muted pl-4 space-y-4">
                {enrichedPerson.previous_roles.map((role, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-primary" />
                    <h4 className="text-sm font-medium">{role.title}</h4>
                    <p className="text-sm text-muted-foreground">{role.company}</p>
                    {role.years && <p className="text-xs text-muted-foreground">{role.years}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {enrichedPerson.education && enrichedPerson.education.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4" /> Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {enrichedPerson.education.map((edu, idx) => (
                  <li key={idx} className="text-sm">
                    <span className="font-medium">{edu.degree}</span>
                    {edu.institution && ` - ${edu.institution}`}
                    {edu.year && <span className="text-muted-foreground"> ({edu.year})</span>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Notable Quotes */}
        {enrichedPerson.quotes && enrichedPerson.quotes.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Notable Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {enrichedPerson.quotes.map((quote, idx) => (
                  <blockquote key={idx} className="text-sm italic border-l-2 border-muted pl-3">
                    "{quote}"
                  </blockquote>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sources */}
        {enrichedPerson.all_citations && enrichedPerson.all_citations.length > 0 && (
          <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                View all {enrichedPerson.all_citations.length} sources
                <ChevronDown className={`h-4 w-4 transition-transform ${sourcesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card>
                <CardContent className="pt-4">
                  <ul className="space-y-1">
                    {enrichedPerson.all_citations.map((url, idx) => (
                      <li key={idx}>
                        <a href={url} target="_blank" rel="noopener noreferrer"
                           className="text-xs text-primary hover:underline break-all">
                          {url}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    );
  }

  // Show loading results state
  if (status?.is_complete && isLoadingResults) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show progress state
  if (isPolling && status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            {/* Pulsing search icon */}
            <div className="animate-pulse">
              <Search className="h-12 w-12 mx-auto text-primary" />
            </div>
            
            <h3 className="font-medium">Researching {person.full_name}...</h3>
            
            {/* Job created confirmation */}
            {jobId && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Job created successfully</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  Job ID: {jobId.length > 25 ? `${jobId.slice(0, 25)}...` : jobId}
                </p>
              </div>
            )}
            
            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={status.progress_percent || 0} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {(status.progress_percent || 0).toFixed(0)}% complete
              </p>
            </div>
            
            {/* Status badge and details */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="capitalize">
                  {status.status || 'pending'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Processing {status.processed_rows || 0} of {status.total_rows || 1} sources
                <span className="animate-pulse">...</span>
              </p>
            </div>
            
            {/* Polling indicator */}
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3 animate-spin" />
                <span>Checking for updates every 10 seconds</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Last checked: {getRelativeTime(lastUpdated)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show initial state with start button
  const context = getContext();

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Search className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-medium">Research Profile</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get AI-powered insights about this person including career history,
              contact info, and recent news.
            </p>
          </div>
          
          <div className="bg-muted rounded-lg p-3 text-left space-y-2">
            <label className="text-xs text-muted-foreground">
              Context (optional - helps improve research accuracy):
            </label>
            <Textarea
              value={editableContext}
              onChange={(e) => setEditableContext(e.target.value)}
              placeholder="Add context about this person, e.g. their role, company, LinkedIn URL..."
              className="min-h-[80px] text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled from linked organizations and profile data. Edit to add more details.
            </p>
          </div>

          <Button onClick={handleStartResearch} disabled={isStarting}>
            {isStarting ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Start Research
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
