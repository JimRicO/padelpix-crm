import { Club } from '@/types/database';
import { useStartClubEnrichment } from '@/hooks/useClubEnrichment';
import { usePushToPadelpix } from '@/hooks/usePushToPadelpix';
import { useAnalyzeVisualDna } from '@/hooks/useAnalyzeVisualDna';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Sparkles, Loader2, Send, RefreshCw, Eye, Check } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface ActionWorkflowCardProps {
  club: Club;
}

export function ActionWorkflowCard({ club }: ActionWorkflowCardProps) {
  const startEnrichment = useStartClubEnrichment();
  const pushToPadelpix = usePushToPadelpix();
  const analyzeVisualDna = useAnalyzeVisualDna();
  
  const [showPushConfirm, setShowPushConfirm] = useState(false);
  const [showMissingDnaWarning, setShowMissingDnaWarning] = useState(false);
  const [pendingPushAfterAnalyze, setPendingPushAfterAnalyze] = useState(false);

  const isEnriching = club.enrichment_status === 'pending' || club.enrichment_status === 'processing';
  const isEnriched = club.enrichment_status === 'completed';
  const isPushedToPadelpix = !!club.pushed_to_padelpix_at;
  const isVisualDnaAnalyzed = !!club.visual_dna_analyzed_at;
  const canAnalyzeVisualDna = isEnriched && !!club.instagram_handle;
  const canPushToPadelpix = club.club_name && (club.instagram_handle || club.website);

  const handleEnrich = () => {
    startEnrichment.mutate({
      clubId: club.id,
      name: club.club_name,
      website: club.website || undefined,
      instagramHandle: club.instagram_handle || undefined,
    });
  };

  const handleAnalyzeVisualDna = () => {
    analyzeVisualDna.mutate(club.id);
  };

  const handlePushButtonClick = () => {
    if (!club.visual_dna_analyzed_at) {
      setShowMissingDnaWarning(true);
    } else {
      setShowPushConfirm(true);
    }
  };

  const handlePushToPadelpix = async () => {
    setShowPushConfirm(false);
    pushToPadelpix.mutate(club.id);
  };

  const handlePushWithoutDna = () => {
    setShowMissingDnaWarning(false);
    pushToPadelpix.mutate(club.id);
  };

  const handleAnalyzeThenPush = () => {
    setShowMissingDnaWarning(false);
    setPendingPushAfterAnalyze(true);
    analyzeVisualDna.mutate(club.id, {
      onSuccess: () => {
        pushToPadelpix.mutate(club.id);
        setPendingPushAfterAnalyze(false);
      },
      onError: () => {
        setPendingPushAfterAnalyze(false);
      },
    });
  };

  return (
    <div className="rounded-xl bg-background p-4 shadow-[5px_5px_10px_hsl(var(--shadow-dark)_/_0.5),_-2px_-2px_5px_hsl(var(--shadow-light)_/_0.2)]">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Action Workflow</h3>
      
      <div className="flex flex-wrap items-center gap-3">
        {/* Step 1: Enrich */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
          {isEnriching ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enriching...
            </Button>
          ) : isEnriched ? (
            <Button variant="outline" size="sm" onClick={handleEnrich} disabled={startEnrichment.isPending}>
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Re-enrich
              <Badge variant="secondary" className="ml-2 text-xs">Done</Badge>
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEnrich}
              disabled={startEnrichment.isPending}
            >
              {startEnrichment.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Enrich
            </Button>
          )}
        </div>

        {/* Step 2: Analyze Visual DNA */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-600 text-xs font-bold">2</span>
          {canAnalyzeVisualDna ? (
            isVisualDnaAnalyzed ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-cyan-500" />
                  <span>DNA {format(new Date(club.visual_dna_analyzed_at!), 'MMM d')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAnalyzeVisualDna}
                  disabled={analyzeVisualDna.isPending}
                  className="border-cyan-500/30 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950"
                >
                  {analyzeVisualDna.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Re-analyze
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnalyzeVisualDna}
                disabled={analyzeVisualDna.isPending}
                className="border-cyan-500/30 text-cyan-700 hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-950"
              >
                {analyzeVisualDna.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing... (30-60s)
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Analyze Visual DNA
                  </>
                )}
              </Button>
            )
          ) : (
            <Button variant="outline" size="sm" disabled className="opacity-50">
              <Eye className="w-4 h-4 mr-2" />
              Analyze DNA
            </Button>
          )}
        </div>

        {/* Step 3: Push to PadelPix */}
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">3</span>
          {canPushToPadelpix && isEnriched ? (
            isPushedToPadelpix ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-success" />
                  <span>Pushed {format(new Date(club.pushed_to_padelpix_at!), 'MMM d')}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePushButtonClick}
                  disabled={pushToPadelpix.isPending}
                  className="text-primary border-primary/30 hover:bg-accent hover:text-accent-foreground"
                >
                  {pushToPadelpix.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Re-sync
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handlePushButtonClick}
                disabled={pushToPadelpix.isPending || pendingPushAfterAnalyze}
              >
                {pushToPadelpix.isPending || pendingPushAfterAnalyze ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {pendingPushAfterAnalyze ? 'Analyzing & Pushing...' : 'Push to PadelPix'}
              </Button>
            )
          ) : (
            <Button variant="default" size="sm" disabled className="opacity-50">
              <Send className="w-4 h-4 mr-2" />
              Push to PadelPix
            </Button>
          )}
        </div>
      </div>

      {/* Push Confirmation Dialog */}
      <AlertDialog open={showPushConfirm} onOpenChange={setShowPushConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isPushedToPadelpix ? 'Re-sync' : 'Push'} {club.club_name} to PadelPix?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isPushedToPadelpix 
                ? 'This will update the existing club profile in PadelPix with the latest data.'
                : 'This will create a club profile in PadelPix ready for content generation.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePushToPadelpix}
              className="bg-primary hover:bg-primary/90"
            >
              {isPushedToPadelpix ? 'Re-sync' : 'Push to PadelPix'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Missing Visual DNA Warning Dialog */}
      <AlertDialog open={showMissingDnaWarning} onOpenChange={setShowMissingDnaWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-amber-500" />
              Visual DNA Not Analyzed
            </AlertDialogTitle>
            <AlertDialogDescription>
              This club hasn't been analyzed with Visual DNA yet. Push without Visual DNA data, or analyze first?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handlePushWithoutDna}
              className="border-amber-500/30 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950"
            >
              <Send className="w-4 h-4 mr-2" />
              Push Without DNA
            </Button>
            <Button
              onClick={handleAnalyzeThenPush}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              Analyze First
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
