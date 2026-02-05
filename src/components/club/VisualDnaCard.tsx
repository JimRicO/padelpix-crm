 import { useState } from 'react';
 import { format } from 'date-fns';
 import { ChevronDown, ChevronRight, Eye, Palette, Camera, Layout, Stamp, PieChart, MessageSquare, Target, Code } from 'lucide-react';
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
 import { Badge } from '@/components/ui/badge';
 import { Club, VisualDnaData, VoiceDnaData, CtltMatchData } from '@/types/database';
 import { cn } from '@/lib/utils';
 
 interface VisualDnaCardProps {
   club: Club;
 }
 
 // Score color mapping
 function getScoreColor(score: number): string {
   if (score >= 80) return 'bg-blue-500 text-white';
   if (score >= 60) return 'bg-green-500 text-white';
   if (score >= 40) return 'bg-yellow-500 text-black';
   if (score >= 20) return 'bg-orange-500 text-white';
   return 'bg-red-500 text-white';
 }
 
 function getScoreCategory(score: number): string {
   if (score >= 80) return 'Excellent';
   if (score >= 60) return 'Strong';
   if (score >= 40) return 'Average';
   if (score >= 20) return 'Struggling';
   return 'Invisible';
 }
 
 function getTrendIcon(trend?: string): string {
   switch (trend) {
     case 'accelerating': return '↑';
     case 'steady': return '→';
     case 'declining': return '↓';
     case 'dormant': return '⏸';
     default: return '—';
   }
 }
 
 export function VisualDnaCard({ club }: VisualDnaCardProps) {
   const [isOpen, setIsOpen] = useState(false);
   const [showRawJson, setShowRawJson] = useState(false);
 
   const visualDna = club.visual_dna as VisualDnaData | null;
   const voiceDna = club.voice_dna as VoiceDnaData | null;
   const ctltMatches = club.ctlt_matches as CtltMatchData | null;
   const score = club.invisibility_score;
   const category = club.invisibility_category;
   const analyzedAt = club.visual_dna_analyzed_at;
 
   if (!visualDna && !voiceDna && score === null) {
     return null;
   }
 
   const scoreBreakdown = visualDna?.score_breakdown;
   const postingDetail = visualDna?.posting_frequency_detail;
   const colors = visualDna?.dominant_colors || [];
   const photoStyle = visualDna?.photography_style;
   const composition = visualDna?.composition;
   const branding = visualDna?.branding_elements;
   const contentMix = visualDna?.content_mix;
 
   return (
     <div className="space-y-4">
       <Collapsible open={isOpen} onOpenChange={setIsOpen}>
         <CollapsibleTrigger className="w-full">
           <div className="flex items-center justify-between p-3 rounded-lg neu-card hover:shadow-md transition-shadow cursor-pointer">
             <div className="flex items-center gap-3">
               {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
               <Eye className="w-4 h-4 text-cyan-500" />
               <span className="font-medium">Visual DNA</span>
               {score !== null && (
                 <Badge className={cn('ml-2', getScoreColor(score))}>
                   {score} — {category || getScoreCategory(score)}
                 </Badge>
               )}
             </div>
             {analyzedAt && (
               <span className="text-xs text-muted-foreground">
                 Analyzed {format(new Date(analyzedAt), 'MMM d, yyyy')}
               </span>
             )}
           </div>
         </CollapsibleTrigger>
 
         <CollapsibleContent>
           <div className="mt-4 space-y-6 p-4 rounded-lg neu-pressed">
             {/* Section 1: Score Header */}
             {score !== null && (
               <div className="text-center space-y-2">
                 <div className={cn('inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold', getScoreColor(score))}>
                   {score}
                 </div>
                 <div>
                   <Badge className={cn('text-sm px-4 py-1', getScoreColor(score))}>
                     {category || getScoreCategory(score)}
                   </Badge>
                 </div>
                 {analyzedAt && (
                   <p className="text-xs text-muted-foreground">
                     Analyzed on {format(new Date(analyzedAt), 'MMMM d, yyyy')}
                   </p>
                 )}
               </div>
             )}
 
             {/* Section 2: Score Breakdown */}
             {scoreBreakdown && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <Target className="w-4 h-4" /> Score Breakdown
                 </h4>
                 <div className="space-y-2">
                   {scoreBreakdown.posting_frequency && (
                     <ScoreRow 
                       label="Posting Frequency" 
                       weight={30} 
                       score={scoreBreakdown.posting_frequency.score}
                       value={scoreBreakdown.posting_frequency.value}
                     />
                   )}
                   {scoreBreakdown.content_quality && (
                     <ScoreRow 
                       label="Content Quality" 
                       weight={25} 
                       score={scoreBreakdown.content_quality.score}
                       value={scoreBreakdown.content_quality.value}
                     />
                   )}
                   {scoreBreakdown.brand_consistency && (
                     <ScoreRow 
                       label="Brand Consistency" 
                       weight={20} 
                       score={scoreBreakdown.brand_consistency.score}
                       value={scoreBreakdown.brand_consistency.value}
                     />
                   )}
                   {scoreBreakdown.engagement_rate && (
                     <ScoreRow 
                       label="Engagement Rate" 
                       weight={15} 
                       score={scoreBreakdown.engagement_rate.score}
                       value={scoreBreakdown.engagement_rate.value}
                     />
                   )}
                   {scoreBreakdown.caption_effort && (
                     <ScoreRow 
                       label="Caption Effort" 
                       weight={10} 
                       score={scoreBreakdown.caption_effort.score}
                       value={scoreBreakdown.caption_effort.value}
                     />
                   )}
                 </div>
               </div>
             )}
 
             {/* Section 3: Posting Frequency Detail */}
             {postingDetail && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Posting Frequency</h4>
                 <div className="grid grid-cols-3 gap-3 text-sm">
                   {postingDetail.posts_last_30_days !== undefined && (
                     <div className="p-2 rounded bg-muted/50">
                       <div className="font-medium">{postingDetail.posts_last_30_days} posts</div>
                       <div className="text-xs text-muted-foreground">Last 30 days ({postingDetail.posts_per_week_30d?.toFixed(1)}/wk)</div>
                     </div>
                   )}
                   {postingDetail.posts_last_90_days !== undefined && (
                     <div className="p-2 rounded bg-muted/50">
                       <div className="font-medium">{postingDetail.posts_last_90_days} posts</div>
                       <div className="text-xs text-muted-foreground">Last 90 days ({postingDetail.posts_per_week_90d?.toFixed(1)}/wk)</div>
                     </div>
                   )}
                   {postingDetail.posts_last_12_months !== undefined && (
                     <div className="p-2 rounded bg-muted/50">
                       <div className="font-medium">{postingDetail.posts_last_12_months} posts</div>
                       <div className="text-xs text-muted-foreground">Last 12 months ({postingDetail.posts_per_week_12mo?.toFixed(1)}/wk)</div>
                     </div>
                   )}
                 </div>
                 <div className="flex gap-4 text-sm">
                   {postingDetail.trend && (
                     <div>
                       <span className="text-muted-foreground">Trend:</span>{' '}
                       <span className="font-medium">{postingDetail.trend} {getTrendIcon(postingDetail.trend)}</span>
                     </div>
                   )}
                   {postingDetail.last_post_days_ago !== undefined && (
                     <div>
                       <span className="text-muted-foreground">Last post:</span>{' '}
                       <span className="font-medium">{postingDetail.last_post_days_ago} days ago</span>
                     </div>
                   )}
                   {postingDetail.longest_gap_days !== undefined && (
                     <div>
                       <span className="text-muted-foreground">Longest gap:</span>{' '}
                       <span className="font-medium">{postingDetail.longest_gap_days} days</span>
                     </div>
                   )}
                 </div>
               </div>
             )}
 
             {/* Section 4: Color Palette */}
             {colors.length > 0 && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <Palette className="w-4 h-4" /> Color Palette
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {colors.map((color, i) => (
                     <div key={i} className="flex flex-col items-center gap-1">
                       <div 
                         className="w-8 h-8 rounded-full border border-border shadow-sm"
                         style={{ backgroundColor: color }}
                       />
                       <span className="text-xs text-muted-foreground font-mono">{color}</span>
                     </div>
                   ))}
                 </div>
               </div>
             )}
 
             {/* Section 5: Photography Style */}
             {photoStyle && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <Camera className="w-4 h-4" /> Photography Style
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {photoStyle.primary_style && <Badge variant="secondary">{photoStyle.primary_style}</Badge>}
                   {photoStyle.secondary_style && <Badge variant="outline">{photoStyle.secondary_style}</Badge>}
                   {photoStyle.lighting && <Badge variant="outline">Lighting: {photoStyle.lighting}</Badge>}
                   {photoStyle.saturation && <Badge variant="outline">Saturation: {photoStyle.saturation}</Badge>}
                   {photoStyle.contrast && <Badge variant="outline">Contrast: {photoStyle.contrast}</Badge>}
                 </div>
               </div>
             )}
 
             {/* Section 6: Composition */}
             {composition && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <Layout className="w-4 h-4" /> Composition
                 </h4>
                 <div className="flex flex-wrap gap-2">
                   {composition.primary_shot_type && <Badge variant="secondary">{composition.primary_shot_type}</Badge>}
                   {composition.action_vs_lifestyle_ratio && <Badge variant="outline">{composition.action_vs_lifestyle_ratio}</Badge>}
                   {composition.people_presence && <Badge variant="outline">People: {composition.people_presence}</Badge>}
                   {composition.court_visibility && <Badge variant="outline">Courts: {composition.court_visibility}</Badge>}
                 </div>
               </div>
             )}
 
             {/* Section 7: Branding Elements */}
             {branding && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <Stamp className="w-4 h-4" /> Branding Elements
                 </h4>
                 <div className="grid grid-cols-2 gap-2 text-sm">
                   <div>
                     <span className="text-muted-foreground">Logo visible:</span>{' '}
                     <span className="font-medium">{branding.logo_visible ? 'Yes' : 'No'}</span>
                     {branding.logo_placement && <span className="text-muted-foreground"> ({branding.logo_placement})</span>}
                   </div>
                   <div>
                     <span className="text-muted-foreground">Watermark:</span>{' '}
                     <span className="font-medium">{branding.watermark ? 'Yes' : 'No'}</span>
                   </div>
                   <div>
                     <span className="text-muted-foreground">Text overlays:</span>{' '}
                     <span className="font-medium">{branding.text_overlays || 'None'}</span>
                   </div>
                   <div>
                     <span className="text-muted-foreground">Branded templates:</span>{' '}
                     <span className="font-medium">{branding.branded_templates ? 'Yes' : 'No'}</span>
                   </div>
                 </div>
               </div>
             )}
 
             {/* Section 8: Content Mix */}
             {contentMix && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <PieChart className="w-4 h-4" /> Content Mix
                 </h4>
                 <ContentMixBar contentMix={contentMix} />
               </div>
             )}
 
             {/* Section 9: Voice Profile */}
             {voiceDna && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                   <MessageSquare className="w-4 h-4" /> Voice Profile
                 </h4>
                 <div className="grid grid-cols-2 gap-3 text-sm">
                   {voiceDna.tone && (
                     <div>
                       <span className="text-muted-foreground">Tone:</span>{' '}
                       <span className="font-medium">{voiceDna.tone}</span>
                       {voiceDna.energy_level && <span className="text-muted-foreground"> ({voiceDna.energy_level})</span>}
                     </div>
                   )}
                   {voiceDna.caption_length_avg !== undefined && (
                     <div>
                       <span className="text-muted-foreground">Avg caption:</span>{' '}
                       <span className="font-medium">{voiceDna.caption_length_avg} chars</span>
                     </div>
                   )}
                   {voiceDna.emoji_frequency && (
                     <div>
                       <span className="text-muted-foreground">Emoji:</span>{' '}
                       <span className="font-medium">{voiceDna.emoji_frequency}</span>
                       {voiceDna.top_emojis && voiceDna.top_emojis.length > 0 && (
                         <span className="ml-1">{voiceDna.top_emojis.slice(0, 5).join('')}</span>
                       )}
                     </div>
                   )}
                   {voiceDna.hashtag_avg_count !== undefined && (
                     <div>
                       <span className="text-muted-foreground">Hashtags:</span>{' '}
                       <span className="font-medium">{voiceDna.hashtag_avg_count} avg</span>
                       {voiceDna.hashtag_placement && <span className="text-muted-foreground"> ({voiceDna.hashtag_placement})</span>}
                     </div>
                   )}
                   {voiceDna.cta_frequency && (
                     <div>
                       <span className="text-muted-foreground">CTAs:</span>{' '}
                       <span className="font-medium">{voiceDna.cta_frequency}</span>
                       {voiceDna.cta_style && <span className="text-muted-foreground"> ({voiceDna.cta_style})</span>}
                     </div>
                   )}
                   {voiceDna.languages_detected && voiceDna.languages_detected.length > 0 && (
                     <div>
                       <span className="text-muted-foreground">Languages:</span>{' '}
                       <span className="font-medium">{voiceDna.languages_detected.join(', ')}</span>
                     </div>
                   )}
                 </div>
                 {voiceDna.branded_hashtags && voiceDna.branded_hashtags.length > 0 && (
                   <div className="flex flex-wrap gap-1">
                     {voiceDna.branded_hashtags.map((tag, i) => (
                       <Badge key={i} variant="outline" className="text-xs">#{tag}</Badge>
                     ))}
                   </div>
                 )}
                 {voiceDna.recurring_themes && voiceDna.recurring_themes.length > 0 && (
                   <div>
                     <span className="text-xs text-muted-foreground">Themes: </span>
                     <div className="flex flex-wrap gap-1 mt-1">
                       {voiceDna.recurring_themes.map((theme, i) => (
                         <Badge key={i} variant="secondary" className="text-xs">{theme}</Badge>
                       ))}
                     </div>
                   </div>
                 )}
                 {voiceDna.signature_phrases && voiceDna.signature_phrases.length > 0 && (
                   <div className="text-sm italic text-muted-foreground">
                     "{voiceDna.signature_phrases[0]}"
                   </div>
                 )}
               </div>
             )}
 
             {/* Section 10: CTLT Style Matches */}
             {ctltMatches && (
               <div className="space-y-3">
                 <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">CTLT Style Matches</h4>
                  {/* Support both API formats: matched_styles (new) and top_matches (legacy) */}
                  {(ctltMatches.matched_styles || ctltMatches.top_matches) && (
                   <div className="space-y-1">
                     <span className="text-xs text-muted-foreground">Top matches:</span>
                     <div className="flex flex-wrap gap-1">
                        {(ctltMatches.matched_styles || []).slice(0, 5).map((match, i) => (
                          <Badge key={i} className="bg-green-500/20 text-green-700 border-green-500/30">
                            {match.style_name} ({match.match_score}/10)
                          </Badge>
                        ))}
                        {/* Legacy format fallback */}
                        {!ctltMatches.matched_styles && ctltMatches.top_matches && ctltMatches.top_matches.slice(0, 5).map((match, i) => (
                          <Badge key={i} className="bg-green-500/20 text-green-700 border-green-500/30">
                            {match.style} ({match.score}/10)
                          </Badge>
                        ))}
                     </div>
                   </div>
                 )}
                 {ctltMatches.styles_to_avoid && ctltMatches.styles_to_avoid.length > 0 && (
                   <div className="space-y-1">
                     <span className="text-xs text-muted-foreground">Avoid:</span>
                     <div className="flex flex-wrap gap-1">
                        {ctltMatches.styles_to_avoid.map((style, i) => {
                          // Handle both object format { style_name, reason } and string format
                          const styleName = typeof style === 'string' ? style : style.style_name;
                          return (
                            <Badge key={i} className="bg-red-500/20 text-red-700 border-red-500/30">
                              {styleName}
                            </Badge>
                          );
                        })}
                     </div>
                   </div>
                 )}
                 {ctltMatches.enhancement_suggestion && (
                   <p className="text-sm italic text-muted-foreground">
                     💡 {ctltMatches.enhancement_suggestion}
                   </p>
                 )}
               </div>
             )}
 
             {/* Raw JSON Toggle */}
             <Collapsible open={showRawJson} onOpenChange={setShowRawJson}>
               <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                 {showRawJson ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                 <Code className="w-3 h-3" />
                 Raw JSON
               </CollapsibleTrigger>
               <CollapsibleContent>
                 <div className="mt-2 p-3 rounded bg-muted/50 overflow-auto max-h-64">
                   <pre className="text-xs font-mono">
                     {JSON.stringify({ visual_dna: visualDna, voice_dna: voiceDna, ctlt_matches: ctltMatches }, null, 2)}
                   </pre>
                 </div>
               </CollapsibleContent>
             </Collapsible>
           </div>
         </CollapsibleContent>
       </Collapsible>
     </div>
   );
 }
 
 // Helper Components
 function ScoreRow({ label, weight, score, value }: { label: string; weight: number; score: number; value?: string | number }) {
   return (
     <div className="flex items-center justify-between text-sm">
       <div className="flex items-center gap-2">
         <span>{label}</span>
         <span className="text-xs text-muted-foreground">({weight}%)</span>
       </div>
       <div className="flex items-center gap-2">
         {value !== undefined && <span className="text-muted-foreground">{value}</span>}
         <Badge variant="outline" className="min-w-[3rem] justify-center">
           {score}
         </Badge>
       </div>
     </div>
   );
 }
 
 function ContentMixBar({ contentMix }: { contentMix: { action?: number; lifestyle?: number; events?: number; coaching?: number; facility?: number; community?: number; promotional?: number } }) {
   const categories = [
     { key: 'action', label: 'Action', color: 'bg-red-500' },
     { key: 'lifestyle', label: 'Lifestyle', color: 'bg-blue-500' },
     { key: 'events', label: 'Events', color: 'bg-purple-500' },
     { key: 'coaching', label: 'Coaching', color: 'bg-green-500' },
     { key: 'facility', label: 'Facility', color: 'bg-yellow-500' },
     { key: 'community', label: 'Community', color: 'bg-pink-500' },
     { key: 'promotional', label: 'Promo', color: 'bg-orange-500' },
   ];
 
   const total = categories.reduce((sum, cat) => sum + (contentMix[cat.key as keyof typeof contentMix] || 0), 0);
   if (total === 0) return null;
 
   return (
     <div className="space-y-2">
       <div className="flex h-6 rounded-lg overflow-hidden">
         {categories.map(cat => {
           const value = contentMix[cat.key as keyof typeof contentMix] || 0;
           if (value === 0) return null;
           const percentage = (value / total) * 100;
           return (
             <div
               key={cat.key}
               className={cn('flex items-center justify-center text-xs text-white font-medium', cat.color)}
               style={{ width: `${percentage}%` }}
               title={`${cat.label}: ${value}%`}
             >
               {percentage >= 10 && `${Math.round(value)}%`}
             </div>
           );
         })}
       </div>
       <div className="flex flex-wrap gap-2">
         {categories.map(cat => {
           const value = contentMix[cat.key as keyof typeof contentMix];
           if (!value) return null;
           return (
             <div key={cat.key} className="flex items-center gap-1 text-xs">
               <div className={cn('w-2 h-2 rounded-full', cat.color)} />
               <span>{cat.label} {value}%</span>
             </div>
           );
         })}
       </div>
     </div>
   );
 }