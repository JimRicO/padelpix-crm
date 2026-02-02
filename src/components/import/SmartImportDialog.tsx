import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Sparkles, 
  Upload, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle,
  Building2,
  Users,
  MapPin,
  Loader2,
} from 'lucide-react';
import { useSmartImport, EntityType } from '@/hooks/useSmartImport';
import { cn } from '@/lib/utils';

interface SmartImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ENTITY_ICONS = {
  club: MapPin,
  organization: Building2,
  person: Users,
};

const ENTITY_LABELS = {
  club: 'Clubs',
  organization: 'Organizations',
  person: 'People',
};

export function SmartImportDialog({ open, onOpenChange }: SmartImportDialogProps) {
  const [inputText, setInputText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    step,
    isProcessing,
    result,
    analyzeData,
    importRecords,
    reset,
    overrideEntityType,
    setStep,
  } = useSmartImport();

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      reset();
      setInputText('');
    }, 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  const handleAnalyze = () => {
    analyzeData(inputText);
  };

  const handleImport = async () => {
    await importRecords();
    handleClose();
  };

  const EntityIcon = result?.entity_type ? ENTITY_ICONS[result.entity_type] : MapPin;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Import (AI-Powered)
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="space-y-4 flex-1">
            <p className="text-sm text-muted-foreground">
              Paste JSON, CSV, or any structured data. Our AI will detect the entity type and map fields automatically.
            </p>

            <Textarea
              placeholder="Paste your data here...

Examples:
• JSON array of clubs
• CSV with headers
• Raw text with names and emails
• Copy-pasted spreadsheet data"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[250px] font-mono text-sm"
            />

            <div className="flex items-center justify-between">
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,.csv,.txt"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <span className="text-xs text-muted-foreground ml-2">
                  JSON, CSV, TXT
                </span>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!inputText.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze with AI
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-medium">Analyzing your data...</p>
            <p className="text-sm text-muted-foreground">
              Claude Haiku is detecting entity types and mapping fields
            </p>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 'preview' && result && (
          <div className="flex flex-col min-h-0 overflow-hidden">
            {/* Detection summary */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <EntityIcon className="w-8 h-8 text-primary" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">
                      {result.records.length} {ENTITY_LABELS[result.entity_type]}
                    </span>
                    <Badge
                      variant={result.confidence === 'high' ? 'default' : 'secondary'}
                      className={cn(
                        result.confidence === 'high' && 'bg-green-500/20 text-green-700 border-green-500/30',
                        result.confidence === 'medium' && 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30',
                        result.confidence === 'low' && 'bg-red-500/20 text-red-700 border-red-500/30'
                      )}
                    >
                      {result.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Detected as {result.entity_type}s
                  </p>
                </div>
              </div>

              <Select
                value={result.entity_type}
                onValueChange={(v) => overrideEntityType(v as EntityType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="club">Clubs</SelectItem>
                  <SelectItem value="organization">Organizations</SelectItem>
                  <SelectItem value="person">People</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Scrollable content area */}
            <ScrollArea className="flex-1 min-h-0 my-4 pr-2">
              <div className="space-y-4">
                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-700 mb-1">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Warnings</span>
                    </div>
                    <ul className="text-sm text-yellow-700/80 list-disc list-inside">
                      {result.warnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Field mappings */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Field Mappings</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(result.field_mappings).slice(0, 8).map(([from, to]) => (
                      <div key={from} className="flex items-center gap-2 text-muted-foreground">
                        <span className="truncate">{from}</span>
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        <span className="text-foreground font-mono text-xs truncate">{to}</span>
                        <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                  {result.unmapped_fields.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Unmapped: {result.unmapped_fields.join(', ')}
                    </p>
                  )}
                </div>

                {/* Preview records */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Preview (first 5 records)</h4>
                  <div className="border rounded-lg p-3 space-y-2">
                    {result.records.slice(0, 5).map((record, i) => {
                      const nameField = result.entity_type === 'club' 
                        ? 'club_name' 
                        : result.entity_type === 'organization' 
                          ? 'name' 
                          : 'full_name';
                      
                      return (
                        <div 
                          key={i} 
                          className="flex items-center gap-3 p-2 bg-muted/50 rounded"
                        >
                          <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
                          <span className="font-medium flex-1 truncate">
                            {record[nameField] as string || 'Unnamed'}
                          </span>
                          {record.country && (
                            <Badge variant="outline" className="text-xs">
                              {record.country as string}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    {result.records.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        ...and {result.records.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions - fixed at bottom */}
            <div className="flex items-center justify-between pt-4 border-t flex-shrink-0 bg-background">
              <Button
                variant="outline"
                onClick={() => {
                  setStep('input');
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleImport}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {result.records.length} {ENTITY_LABELS[result.entity_type]}
                    <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
