import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useBulkCreateClubs, useClubs } from '@/hooks/useClubs';
import { Upload, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle, Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { detectOwnershipGroup } from '@/utils/ownershipPatterns';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedClub {
  club_name: string;
  instagram_handle?: string;
  suburb?: string;
  city?: string;
  country?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  number_of_courts?: number;
  address?: string;
  contact_name?: string;
  coaches?: string[];
  tier?: 'group_owned' | 'large' | 'multi_court' | 'boutique';
  priority?: 'high' | 'medium' | 'low';
  isDuplicate?: boolean;
  detectedOwnership?: string | null;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [rawData, setRawData] = useState('');
  const [parsedClubs, setParsedClubs] = useState<ParsedClub[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [isExtractingLocations, setIsExtractingLocations] = useState(false);

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);
  
  const { data: existingClubs } = useClubs();
  const bulkCreate = useBulkCreateClubs();

  const cleanInstagramHandle = (handle: string | undefined): string | undefined => {
    if (!handle) return undefined;
    return handle.replace(/^@/, '').trim().toLowerCase();
  };

  const inferTier = (courts: number | undefined): 'large' | 'multi_court' | 'boutique' | undefined => {
    if (!courts) return undefined;
    if (courts >= 6) return 'large';
    if (courts >= 3) return 'multi_court';
    return 'boutique';
  };

  const checkDuplicate = useCallback((instagram: string | undefined): boolean => {
    if (!instagram || !existingClubs) return false;
    const cleaned = cleanInstagramHandle(instagram);
    return existingClubs.some(c => 
      c.instagram_handle && cleanInstagramHandle(c.instagram_handle) === cleaned
    );
  }, [existingClubs]);

  const parseCSV = (text: string): ParsedClub[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    const fieldMap: Record<string, string> = {
      'club_name': 'club_name',
      'clubname': 'club_name',
      'name': 'club_name',
      'instagram': 'instagram_handle',
      'instagram_handle': 'instagram_handle',
      'ig': 'instagram_handle',
      'city': 'city',
      'country': 'country',
      'website': 'website',
      'url': 'website',
      'whatsapp': 'whatsapp',
      'phone': 'whatsapp',
      'email': 'email',
      'courts': 'number_of_courts',
      'number_of_courts': 'number_of_courts',
      'num_courts': 'number_of_courts',
      'address': 'address',
    };

    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const club: ParsedClub = { club_name: '' };
      
      headers.forEach((header, i) => {
        const mappedField = fieldMap[header];
        if (mappedField && values[i]) {
          if (mappedField === 'number_of_courts') {
            club.number_of_courts = parseInt(values[i], 10) || undefined;
          } else if (mappedField === 'club_name') {
            club.club_name = values[i];
          } else if (mappedField === 'instagram_handle') {
            club.instagram_handle = values[i];
          } else if (mappedField === 'city') {
            club.city = values[i];
          } else if (mappedField === 'country') {
            club.country = values[i];
          } else if (mappedField === 'website') {
            club.website = values[i];
          } else if (mappedField === 'whatsapp') {
            club.whatsapp = values[i];
          } else if (mappedField === 'email') {
            club.email = values[i];
          } else if (mappedField === 'address') {
            club.address = values[i];
          }
        }
      });

      club.instagram_handle = cleanInstagramHandle(club.instagram_handle);
      club.detectedOwnership = detectOwnershipGroup(club.club_name);
      club.tier = club.detectedOwnership ? 'group_owned' : inferTier(club.number_of_courts);
      club.isDuplicate = checkDuplicate(club.instagram_handle);
      
      return club;
    }).filter(c => c.club_name);
  };

  const parseJSON = (text: string): ParsedClub[] => {
    const data = JSON.parse(text);
    
    // Handle nested structures like { padel_clubs: [...] } or { clubs: [...] }
    let clubs: unknown[];
    if (Array.isArray(data)) {
      clubs = data;
    } else if (data.padel_clubs && Array.isArray(data.padel_clubs)) {
      clubs = data.padel_clubs;
    } else if (data.clubs && Array.isArray(data.clubs)) {
      clubs = data.clubs;
    } else if (typeof data === 'object') {
      clubs = [data];
    } else {
      throw new Error('Invalid JSON structure');
    }
    
    return clubs.map((item: Record<string, unknown>) => {
      // Parse coaches array
      let coaches: string[] | undefined;
      if (Array.isArray(item.coaches)) {
        coaches = item.coaches.filter((c): c is string => typeof c === 'string' && c.trim() !== '');
        if (coaches.length === 0) coaches = undefined;
      }

      const address = item.address as string | undefined;

      // Let the AI layer derive suburb/city/country from address when needed.
      // If the JSON already includes city/country fields, we keep them.
      const city = item.city as string | undefined;
      const country = item.country as string | undefined;

      const club: ParsedClub = {
        club_name: (item.club_name || item.clubName || item.name || '') as string,
        instagram_handle: cleanInstagramHandle((item.instagram_handle || item.instagram || item.ig) as string | undefined),
        city,
        country,
        website: (item.website || item.url) as string | undefined,
        whatsapp: (item.whatsapp || item.whatsapp_number || item.phone) as string | undefined,
        email: item.email as string | undefined,
        number_of_courts: parseInt(String(item.number_of_courts || item.courts || item.numCourts || ''), 10) || undefined,
        address,
        contact_name: (item.owner_or_manager_name || item.contact_name || item.owner || item.manager) as string | undefined,
        coaches,
      };
      
      club.detectedOwnership = detectOwnershipGroup(club.club_name);
      club.tier = club.detectedOwnership ? 'group_owned' : inferTier(club.number_of_courts);
      club.isDuplicate = checkDuplicate(club.instagram_handle);
      
      return club;
    }).filter(c => c.club_name);
  };

  const extractLocationsWithAI = async (clubs: ParsedClub[]): Promise<ParsedClub[]> => {
    // Get addresses that need location extraction
    const addressesToExtract = clubs
      .map((club, index) => ({ index, address: club.address }))
      .filter(item => item.address && (!clubs[item.index].city || !clubs[item.index].country));
    
    if (addressesToExtract.length === 0) return clubs;
    
    try {
      setIsExtractingLocations(true);
      const { data, error } = await supabase.functions.invoke('extract-location', {
        body: { addresses: addressesToExtract.map(a => a.address) }
      });
      
      if (error) {
        console.error('Location extraction error:', error);
        toast.error('Could not extract locations automatically');
        return clubs;
      }
      
      const locations = data?.locations || [];
      const updatedClubs = [...clubs];
      
      addressesToExtract.forEach((item, i) => {
        if (locations[i]) {
          if (!updatedClubs[item.index].suburb && locations[i].suburb) {
            updatedClubs[item.index].suburb = locations[i].suburb;
          }
          if (!updatedClubs[item.index].city && locations[i].city) {
            updatedClubs[item.index].city = locations[i].city;
          }
          if (!updatedClubs[item.index].country && locations[i].country) {
            updatedClubs[item.index].country = locations[i].country;
          }
        }
      });
      
      return updatedClubs;
    } catch (err) {
      console.error('AI extraction failed:', err);
      toast.error('Location extraction failed');
      return clubs;
    } finally {
      setIsExtractingLocations(false);
    }
  };

  const handleParse = async (format: 'csv' | 'json') => {
    setParseError(null);
    try {
      let clubs = format === 'csv' ? parseCSV(rawData) : parseJSON(rawData);
      if (clubs.length === 0) {
        setParseError('No valid clubs found in the data');
        return;
      }
      
      // Use AI to extract locations from addresses
      clubs = await extractLocationsWithAI(clubs);
      
      setParsedClubs(clubs);
      setStep('preview');
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse data');
    }
  };

  const handleImport = () => {
    const clubsToImport = parsedClubs
      .filter(c => !c.isDuplicate)
      .map(({ isDuplicate, ...club }) => club);
    
    bulkCreate.mutate(clubsToImport, {
      onSuccess: () => {
        onOpenChange(false);
        setRawData('');
        setParsedClubs([]);
        setStep('input');
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setRawData('');
    setParsedClubs([]);
    setStep('input');
    setParseError(null);
  };

  const newClubs = parsedClubs.filter(c => !c.isDuplicate);
  const duplicates = parsedClubs.filter(c => c.isDuplicate);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Clubs
          </DialogTitle>
          <DialogDescription>
            Import clubs from CSV or JSON format
          </DialogDescription>
        </DialogHeader>

        {step === 'input' ? (
          <Tabs defaultValue="csv" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="csv" className="gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                CSV
              </TabsTrigger>
              <TabsTrigger value="json" className="gap-2">
                <FileJson className="w-4 h-4" />
                JSON
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv" className="flex-1 flex flex-col gap-4">
              <div className="text-sm text-muted-foreground">
                Upload a CSV file or paste CSV data with headers. Supported columns: name, instagram, city, country, website, whatsapp, email, courts, address
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={csvFileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        setRawData(content);
                      };
                      reader.onerror = () => {
                        setParseError('Failed to read file');
                      };
                      reader.readAsText(file);
                    }
                    // allow selecting the same file again
                    e.target.value = '';
                  }}
                />

                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => csvFileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload .csv file</span>
                </Button>
                {rawData && <span className="text-sm text-muted-foreground">File loaded</span>}
              </div>
              <Textarea 
                placeholder={`club_name,instagram,city,country,courts\nPadel Club One,@padelclub1,Cape Town,South Africa,4\nPadel Club Two,@padelclub2,Johannesburg,South Africa,6`}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="flex-1 min-h-[200px] font-mono text-sm"
              />
              {parseError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {parseError}
                </div>
              )}
              <Button onClick={() => handleParse('csv')} disabled={!rawData.trim() || isExtractingLocations}>
                {isExtractingLocations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting locations...
                  </>
                ) : (
                  'Preview Import'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="json" className="flex-1 flex flex-col gap-4">
              <div className="text-sm text-muted-foreground">
                Upload a JSON file or paste JSON array of club objects
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-muted transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">Upload .json file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setRawData(content);
                        };
                        reader.onerror = () => {
                          setParseError('Failed to read file');
                        };
                        reader.readAsText(file);
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
                {rawData && <span className="text-sm text-muted-foreground">File loaded</span>}
              </div>
              <Textarea 
                placeholder={`[\n  {\n    "name": "Padel Club One",\n    "instagram": "@padelclub1",\n    "city": "Cape Town",\n    "courts": 4\n  }\n]`}
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                className="flex-1 min-h-[200px] font-mono text-sm"
              />
              {parseError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4" />
                  {parseError}
                </div>
              )}
              <Button onClick={() => handleParse('json')} disabled={!rawData.trim() || isExtractingLocations}>
                {isExtractingLocations ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting locations...
                  </>
                ) : (
                  'Preview Import'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-success" />
                <span>{newClubs.length} new clubs</span>
              </div>
              {duplicates.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{duplicates.length} duplicates (will be skipped)</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">Club Name</th>
                    <th className="text-left p-2 font-medium">Instagram</th>
                    <th className="text-left p-2 font-medium">Ownership</th>
                    <th className="text-left p-2 font-medium">City</th>
                    <th className="text-left p-2 font-medium">Courts</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedClubs.map((club, i) => (
                    <tr 
                      key={i} 
                      className={cn(
                        'border-t',
                        club.isDuplicate && 'opacity-50 bg-warning/5'
                      )}
                    >
                      <td className="p-2">{club.club_name}</td>
                      <td className="p-2">{club.instagram_handle && `@${club.instagram_handle}`}</td>
                      <td className="p-2">
                        {club.detectedOwnership && (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            <Building2 className="w-3 h-3" />
                            {club.detectedOwnership}
                          </span>
                        )}
                      </td>
                      <td className="p-2">{club.city}</td>
                      <td className="p-2">{club.number_of_courts}</td>
                      <td className="p-2">
                        {club.isDuplicate ? (
                          <span className="text-warning text-xs">Duplicate</span>
                        ) : (
                          <span className="text-success text-xs">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={newClubs.length === 0 || bulkCreate.isPending}
              >
                {bulkCreate.isPending ? 'Importing...' : `Import ${newClubs.length} Clubs`}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
