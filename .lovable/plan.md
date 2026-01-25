
# Add Gamification: Completion Percentages per Pipeline Stage

## Overview
Add a visual completion percentage indicator at the top of each pipeline column to gamify the CRM experience. This shows what percentage of total clubs have reached or passed each stage.

## How It Works

The completion percentage for each stage represents how many clubs have progressed to **that stage or beyond**:

```text
Example with 10 total clubs:
- Not Contacted: 2 clubs still here
- Followed: 8 clubs have been followed (80% completion)
- Engaged: 6 clubs have been engaged (60% completion)
- DM Sent: 4 clubs received DMs (40% completion)
- Content Created: 2 clubs have content (20% completion)
- Customer: 1 club converted (10% completion)
```

## Visual Design

Each column header will show:
1. Current stage color dot
2. Stage label
3. **New: Slim progress bar with percentage**
4. Count badge

```text
+--------------------------------------------------+
| ● Followed                                        |
| [████████░░░░░░░░░░░░] 80%               [8]      |
+--------------------------------------------------+
| Club cards...                                     |
```

The progress bar will:
- Use the stage's color for the filled portion
- Be slim (h-1.5) to stay compact
- Show percentage text in a small badge

## Files to Modify

### 1. src/components/pipeline/PipelineBoard.tsx
- Add a `useMemo` to calculate completion percentages per stage
- Define stage order for "at or beyond" calculation
- Create a helper component `StageProgressIndicator`
- Insert the progress indicator in each column header

### 2. src/index.css (optional)
- Add `.stage-progress` utility class for consistent styling

## Implementation Details

### Stage Order Definition
```typescript
const STAGE_ORDER: PipelineStage[] = [
  'not_contacted', 'followed', 'engaged', 'dm_sent', 
  'responded', 'content_created', 'trial', 'customer', 'dead'
];
```

### Completion Calculation Logic
```typescript
const stageCompletionPercentages = useMemo(() => {
  if (!clubs || clubs.length === 0) return {};
  
  const totalClubs = clubs.length;
  const percentages: Record<PipelineStage, number> = {} as any;
  
  PIPELINE_STAGES.forEach((stage, stageIndex) => {
    // Count clubs at this stage or beyond (excluding 'dead')
    const clubsAtOrBeyond = clubs.filter(club => {
      const clubStageIndex = PIPELINE_STAGES.indexOf(club.pipeline_stage || 'not_contacted');
      // Don't count 'dead' clubs for progression metrics
      if (club.pipeline_stage === 'dead') return false;
      return clubStageIndex >= stageIndex;
    }).length;
    
    percentages[stage] = Math.round((clubsAtOrBeyond / totalClubs) * 100);
  });
  
  return percentages;
}, [clubs]);
```

### Progress Indicator Component
```tsx
function StageProgressIndicator({ 
  percentage, 
  colorClass 
}: { 
  percentage: number; 
  colorClass: string 
}) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground font-medium min-w-[32px]">
        {percentage}%
      </span>
    </div>
  );
}
```

### Updated Column Header
```tsx
<div className="mb-3">
  <div className="flex items-center gap-2">
    <div className={cn('w-3 h-3 rounded-full', STAGE_CONFIG[stage].colorClass)} />
    <h3 className="font-semibold text-sm text-foreground">
      {STAGE_CONFIG[stage].label}
    </h3>
    <Badge variant="secondary" className="ml-auto text-xs">
      {getStageCount(stage)}
    </Badge>
  </div>
  {/* Only show progress for actionable stages */}
  {stage !== 'not_contacted' && stage !== 'dead' && (
    <StageProgressIndicator 
      percentage={stageCompletionPercentages[stage] || 0}
      colorClass={STAGE_CONFIG[stage].colorClass}
    />
  )}
</div>
```

## Special Cases

| Stage | Behavior |
|-------|----------|
| **Not Contacted** | No progress bar (starting point) |
| **Followed → Content Created** | Shows percentage of clubs that reached this stage |
| **Trial & Customer** | Shows conversion percentages |
| **Dead** | No progress bar (not a progression milestone) |

## Summary

This gamification feature:
- Provides instant visual feedback on pipeline health
- Uses existing stage colors for consistency
- Stays compact with slim progress bars
- Excludes "dead" clubs from progression metrics
- Skips progress bars for non-actionable stages (not_contacted, dead)
