import { useState, useCallback, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useBulkCreateClubs, useClubs } from '@/hooks/useClubs';
import { Upload, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle, Loader2, Building2, Check, X, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { detectOwnershipGroup } from '@/utils/ownershipPatterns';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  // New fields
  phone?: string;
  business_description?: string;
  google_maps_url?: string;
  facebook?: string;
  twitter?: string;
  insta_url?: string;
  insta_bio?: string;
  insta_followers?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_video_views?: number;
  top_hashtags?: string[];
  key_individuals?: string[];
}

interface ColumnMatch {
  csvHeader: string;
  mappedField: string;
  displayName: string;
}

interface FileInfo {
  name: string;
  rowCount: number;
  columnCount: number;
}

// Complete field mapping with display names
const FIELD_MAP: Record<string, { field: string; display: string }> = {
  'club_name': { field: 'club_name', display: 'Club Name' },
  'clubname': { field: 'club_name', display: 'Club Name' },
  'name': { field: 'club_name', display: 'Club Name' },
  'instagram': { field: 'instagram_handle', display: 'Instagram' },
  'instagram_handle': { field: 'instagram_handle', display: 'Instagram' },
  'ig': { field: 'instagram_handle', display: 'Instagram' },
  'city': { field: 'city', display: 'City' },
  'country': { field: 'country', display: 'Country' },
  'website': { field: 'website', display: 'Website' },
  'url': { field: 'website', display: 'Website' },
  'whatsapp': { field: 'whatsapp', display: 'WhatsApp' },
  'phone': { field: 'phone', display: 'Phone' },
  'email': { field: 'email', display: 'Email' },
  'courts': { field: 'number_of_courts', display: 'Courts' },
  'number_of_courts': { field: 'number_of_courts', display: 'Courts' },
  'num_courts': { field: 'number_of_courts', display: 'Courts' },
  'address': { field: 'address', display: 'Address' },
  'contact_name': { field: 'contact_name', display: 'Contact Name' },
  'contact': { field: 'contact_name', display: 'Contact Name' },
  'business_description': { field: 'business_description', display: 'Description' },
  'description': { field: 'business_description', display: 'Description' },
  'google_maps_url': { field: 'google_maps_url', display: 'Google Maps' },
  'maps_url': { field: 'google_maps_url', display: 'Google Maps' },
  'google_maps': { field: 'google_maps_url', display: 'Google Maps' },
  'facebook': { field: 'facebook', display: 'Facebook' },
  'fb': { field: 'facebook', display: 'Facebook' },
  'twitter': { field: 'twitter', display: 'Twitter/X' },
  'x': { field: 'twitter', display: 'Twitter/X' },
  'instagram_url': { field: 'insta_url', display: 'Instagram URL' },
  'insta_url': { field: 'insta_url', display: 'Instagram URL' },
  'instagram_bio': { field: 'insta_bio', display: 'Instagram Bio' },
  'insta_bio': { field: 'insta_bio', display: 'Instagram Bio' },
  'bio': { field: 'insta_bio', display: 'Instagram Bio' },
  'instagram_followers': { field: 'insta_followers', display: 'Followers' },
  'insta_followers': { field: 'insta_followers', display: 'Followers' },
  'followers': { field: 'insta_followers', display: 'Followers' },
  'avg_likes': { field: 'avg_likes', display: 'Avg Likes' },
  'average_likes': { field: 'avg_likes', display: 'Avg Likes' },
  'likes': { field: 'avg_likes', display: 'Avg Likes' },
  'avg_comments': { field: 'avg_comments', display: 'Avg Comments' },
  'average_comments': { field: 'avg_comments', display: 'Avg Comments' },
  'comments': { field: 'avg_comments', display: 'Avg Comments' },
  'avg_video_views': { field: 'avg_video_views', display: 'Avg Video Views' },
  'average_video_views': { field: 'avg_video_views', display: 'Avg Video Views' },
  'video_views': { field: 'avg_video_views', display: 'Avg Video Views' },
  'top_hashtags': { field: 'top_hashtags', display: 'Hashtags' },
  'hashtags': { field: 'top_hashtags', display: 'Hashtags' },
  'key_individuals': { field: 'key_individuals', display: 'Key Individuals' },
  'contacts': { field: 'key_individuals', display: 'Key Individuals' },
  'linkedin': { field: 'linkedin', display: 'LinkedIn' },
  'suburb': { field: 'suburb', display: 'Suburb' },
};

// All possible fields that can be imported (for counting filled fields)
const ALL_IMPORT_FIELDS = [
  'club_name', 'instagram_handle', 'city', 'country', 'website', 'whatsapp', 'phone', 'email',
  'number_of_courts', 'address', 'contact_name', 'business_description', 'google_maps_url',
  'facebook', 'twitter', 'insta_url', 'insta_bio', 'insta_followers', 'avg_likes', 'avg_comments',
  'avg_video_views', 'top_hashtags', 'key_individuals', 'suburb'
];

// Supported columns organized by category for help text
const SUPPORTED_COLUMNS = {
  basic: ['name', 'instagram', 'city', 'country', 'address', 'website', 'email'],
  contact: ['phone', 'whatsapp', 'contact_name'],
  social: ['facebook', 'twitter', 'linkedin'],
  instagram: ['insta_url', 'insta_bio', 'insta_followers', 'avg_likes', 'avg_comments', 'avg_video_views', 'top_hashtags'],
  other: ['courts', 'key_individuals', 'business_description', 'google_maps_url', 'suburb']
};

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [rawData, setRawData] = useState('');
  const [parsedClubs, setParsedClubs] = useState<ParsedClub[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [isExtractingLocations, setIsExtractingLocations] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [matchedColumns, setMatchedColumns] = useState<ColumnMatch[]>([]);
  const [unmatchedColumns, setUnmatchedColumns] = useState<string[]>([]);
  const [showAllColumns, setShowAllColumns] = useState(false);

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

  // Analyze CSV headers to detect matched/unmatched columns
  const analyzeHeaders = (headers: string[]): { matched: ColumnMatch[]; unmatched: string[] } => {
    const matched: ColumnMatch[] = [];
    const unmatched: string[] = [];
    const seenFields = new Set<string>();

    headers.forEach(header => {
      const normalized = header.trim().toLowerCase().replace(/['"]/g, '').replace(/\s+/g, '_');
      const mapping = FIELD_MAP[normalized];
      
      if (mapping && !seenFields.has(mapping.field)) {
        matched.push({
          csvHeader: header,
          mappedField: mapping.field,
          displayName: mapping.display
        });
        seenFields.add(mapping.field);
      } else if (!mapping) {
        unmatched.push(header);
      }
    });

    return { matched, unmatched };
  };

  const parseCSV = (text: string): ParsedClub[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/\s+/g, '_'));
    
    // Analyze headers for feedback
    const { matched, unmatched } = analyzeHeaders(headers);
    setMatchedColumns(matched);
    setUnmatchedColumns(unmatched);

    return lines.slice(1).filter(line => line.trim()).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const club: ParsedClub = { club_name: '' };
      
      normalizedHeaders.forEach((header, i) => {
        const mapping = FIELD_MAP[header];
        if (mapping && values[i]) {
          const mappedField = mapping.field;
          switch (mappedField) {
            case 'number_of_courts':
              club.number_of_courts = parseInt(values[i], 10) || undefined;
              break;
            case 'insta_followers':
              club.insta_followers = parseInt(values[i], 10) || undefined;
              break;
            case 'avg_likes':
              club.avg_likes = parseInt(values[i], 10) || undefined;
              break;
            case 'avg_comments':
              club.avg_comments = parseInt(values[i], 10) || undefined;
              break;
            case 'avg_video_views':
              club.avg_video_views = parseInt(values[i], 10) || undefined;
              break;
            case 'top_hashtags':
              club.top_hashtags = values[i].split(/[;|]/).map(s => s.trim()).filter(Boolean);
              break;
            case 'key_individuals':
              club.key_individuals = values[i].split(/[;|]/).map(s => s.trim()).filter(Boolean);
              break;
            case 'club_name':
              club.club_name = values[i];
              break;
            case 'instagram_handle':
              club.instagram_handle = values[i];
              break;
            case 'city':
              club.city = values[i];
              break;
            case 'country':
              club.country = values[i];
              break;
            case 'website':
              club.website = values[i];
              break;
            case 'whatsapp':
              club.whatsapp = values[i];
              break;
            case 'phone':
              club.phone = values[i];
              break;
            case 'email':
              club.email = values[i];
              break;
            case 'address':
              club.address = values[i];
              break;
            case 'suburb':
              club.suburb = values[i];
              break;
            case 'contact_name':
              club.contact_name = values[i];
              break;
            case 'business_description':
              club.business_description = values[i];
              break;
            case 'google_maps_url':
              club.google_maps_url = values[i];
              break;
            case 'facebook':
              club.facebook = values[i];
              break;
            case 'twitter':
              club.twitter = values[i];
              break;
            case 'insta_url':
              club.insta_url = values[i];
              break;
            case 'insta_bio':
              club.insta_bio = values[i];
              break;
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

    // Analyze JSON keys for feedback
    if (clubs.length > 0) {
      const firstItem = clubs[0] as Record<string, unknown>;
      const keys = Object.keys(firstItem);
      const { matched, unmatched } = analyzeHeaders(keys);
      setMatchedColumns(matched);
      setUnmatchedColumns(unmatched);
    }
    
    return clubs.map((item: Record<string, unknown>) => {
      // Parse coaches array
      let coaches: string[] | undefined;
      if (Array.isArray(item.coaches)) {
        coaches = item.coaches.filter((c): c is string => typeof c === 'string' && c.trim() !== '');
        if (coaches.length === 0) coaches = undefined;
      }

      // Parse other array fields
      const parseArrayField = (val: unknown): string[] | undefined => {
        if (Array.isArray(val)) {
          const arr = val.filter((c): c is string => typeof c === 'string' && c.trim() !== '');
          return arr.length > 0 ? arr : undefined;
        }
        if (typeof val === 'string' && val.trim()) {
          return val.split(/[,;|]/).map(s => s.trim()).filter(Boolean);
        }
        return undefined;
      };

      const address = item.address as string | undefined;
      const city = item.city as string | undefined;
      const country = item.country as string | undefined;

      const club: ParsedClub = {
        club_name: (item.club_name || item.clubName || item.name || '') as string,
        instagram_handle: cleanInstagramHandle((item.instagram_handle || item.instagram || item.ig) as string | undefined),
        city,
        country,
        website: (item.website || item.url) as string | undefined,
        whatsapp: (item.whatsapp || item.whatsapp_number) as string | undefined,
        phone: item.phone as string | undefined,
        email: item.email as string | undefined,
        number_of_courts: parseInt(String(item.number_of_courts || item.courts || item.numCourts || ''), 10) || undefined,
        address,
        contact_name: (item.owner_or_manager_name || item.contact_name || item.owner || item.manager) as string | undefined,
        coaches,
        suburb: item.suburb as string | undefined,
        // New fields
        business_description: (item.business_description || item.description) as string | undefined,
        google_maps_url: (item.google_maps_url || item.google_maps || item.maps_url) as string | undefined,
        facebook: (item.facebook || item.fb) as string | undefined,
        twitter: (item.twitter || item.x) as string | undefined,
        insta_url: (item.insta_url || item.instagram_url) as string | undefined,
        insta_bio: (item.insta_bio || item.instagram_bio || item.bio) as string | undefined,
        insta_followers: parseInt(String(item.insta_followers || item.instagram_followers || item.followers || ''), 10) || undefined,
        avg_likes: parseInt(String(item.avg_likes || item.average_likes || item.likes || ''), 10) || undefined,
        avg_comments: parseInt(String(item.avg_comments || item.average_comments || item.comments || ''), 10) || undefined,
        avg_video_views: parseInt(String(item.avg_video_views || item.average_video_views || item.video_views || ''), 10) || undefined,
        top_hashtags: parseArrayField(item.top_hashtags || item.hashtags),
        key_individuals: parseArrayField(item.key_individuals || item.contacts),
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

  const handleFileUpload = (file: File, format: 'csv' | 'json') => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawData(content);
      
      // Count rows and columns for feedback
      if (format === 'csv') {
        const lines = content.trim().split('\n');
        const headers = lines[0]?.split(',') || [];
        setFileInfo({
          name: file.name,
          rowCount: Math.max(0, lines.length - 1),
          columnCount: headers.length
        });
        // Pre-analyze headers
        const { matched, unmatched } = analyzeHeaders(headers.map(h => h.trim().replace(/^["']|["']$/g, '')));
        setMatchedColumns(matched);
        setUnmatchedColumns(unmatched);
      } else {
        try {
          const data = JSON.parse(content);
          let items: unknown[] = [];
          if (Array.isArray(data)) items = data;
          else if (data.padel_clubs) items = data.padel_clubs;
          else if (data.clubs) items = data.clubs;
          else items = [data];
          
          const firstItem = items[0] as Record<string, unknown> | undefined;
          const keys = firstItem ? Object.keys(firstItem) : [];
          setFileInfo({
            name: file.name,
            rowCount: items.length,
            columnCount: keys.length
          });
          if (keys.length > 0) {
            const { matched, unmatched } = analyzeHeaders(keys);
            setMatchedColumns(matched);
            setUnmatchedColumns(unmatched);
          }
        } catch {
          setFileInfo({ name: file.name, rowCount: 0, columnCount: 0 });
        }
      }
    };
    reader.onerror = () => {
      setParseError('Failed to read file');
    };
    reader.readAsText(file);
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
        setFileInfo(null);
        setMatchedColumns([]);
        setUnmatchedColumns([]);
      },
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setRawData('');
    setParsedClubs([]);
    setStep('input');
    setParseError(null);
    setFileInfo(null);
    setMatchedColumns([]);
    setUnmatchedColumns([]);
  };

  const newClubs = parsedClubs.filter(c => !c.isDuplicate);
  const duplicates = parsedClubs.filter(c => c.isDuplicate);

  // Calculate which columns have data in the parsed clubs
  const columnsWithData = useMemo(() => {
    if (parsedClubs.length === 0) return [];
    
    const fieldsWithData: string[] = [];
    ALL_IMPORT_FIELDS.forEach(field => {
      const hasData = parsedClubs.some(club => {
        const value = club[field as keyof ParsedClub];
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === 'number') return true;
        return Boolean(value);
      });
      if (hasData) fieldsWithData.push(field);
    });
    return fieldsWithData;
  }, [parsedClubs]);

  // Calculate filled fields count for each club
  const getFilledFieldsCount = (club: ParsedClub): number => {
    return ALL_IMPORT_FIELDS.filter(field => {
      const value = club[field as keyof ParsedClub];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'number') return true;
      return Boolean(value);
    }).length;
  };

  // Format large numbers
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // Get display value for a field
  const getDisplayValue = (club: ParsedClub, field: string): string => {
    const value = club[field as keyof ParsedClub];
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '');
    if (field === 'insta_followers' || field === 'avg_likes' || field === 'avg_comments' || field === 'avg_video_views') {
      return formatNumber(value as number);
    }
    if (typeof value === 'string' && value.length > 30) return value.slice(0, 30) + '...';
    return String(value);
  };

  // Define which columns to always show and which to show conditionally
  const alwaysShowColumns = ['club_name', 'instagram_handle', 'city'];
  const priorityColumns = ['insta_followers', 'avg_likes', 'phone', 'email', 'country', 'address'];
  
  const displayColumns = useMemo(() => {
    const cols = [...alwaysShowColumns];
    priorityColumns.forEach(col => {
      if (columnsWithData.includes(col) && !cols.includes(col)) {
        cols.push(col);
      }
    });
    // Add more columns that have data
    columnsWithData.forEach(col => {
      if (!cols.includes(col) && cols.length < 8) {
        cols.push(col);
      }
    });
    return cols;
  }, [columnsWithData]);

  const hiddenColumnsCount = columnsWithData.length - displayColumns.length;

  const getFieldDisplayName = (field: string): string => {
    const entry = Object.values(FIELD_MAP).find(v => v.field === field);
    return entry?.display || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderInputStep = (format: 'csv' | 'json') => (
    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
      {/* Supported columns help */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground text-xs hover:text-foreground">
            <Check className="w-3 h-3 mr-1" />
            View supported columns ({Object.keys(SUPPORTED_COLUMNS).reduce((acc, key) => acc + SUPPORTED_COLUMNS[key as keyof typeof SUPPORTED_COLUMNS].length, 0)} total)
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-2">
            <div><span className="font-medium text-foreground">Basic:</span> {SUPPORTED_COLUMNS.basic.join(', ')}</div>
            <div><span className="font-medium text-foreground">Contact:</span> {SUPPORTED_COLUMNS.contact.join(', ')}</div>
            <div><span className="font-medium text-foreground">Social:</span> {SUPPORTED_COLUMNS.social.join(', ')}</div>
            <div><span className="font-medium text-foreground">Instagram:</span> {SUPPORTED_COLUMNS.instagram.join(', ')}</div>
            <div><span className="font-medium text-foreground">Other:</span> {SUPPORTED_COLUMNS.other.join(', ')}</div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* File upload */}
      <div className="flex items-center gap-2">
        <input
          ref={format === 'csv' ? csvFileInputRef : undefined}
          type="file"
          accept={format === 'csv' ? '.csv,text/csv' : '.json,application/json'}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file, format);
            }
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => {
            if (format === 'csv') {
              csvFileInputRef.current?.click();
            } else {
              document.getElementById('json-file-input')?.click();
            }
          }}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload .{format} file</span>
        </Button>
        {format === 'json' && (
          <input
            id="json-file-input"
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file, 'json');
              }
              e.target.value = '';
            }}
          />
        )}
      </div>

      {/* File info feedback */}
      {fileInfo && (
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileCheck className="w-4 h-4 text-primary" />
            {fileInfo.name}
          </div>
          <div className="text-xs text-muted-foreground">
            Found {fileInfo.rowCount} rows and {fileInfo.columnCount} columns
          </div>
          
          {/* Column recognition summary */}
          {(matchedColumns.length > 0 || unmatchedColumns.length > 0) && (
            <div className="pt-2 border-t border-border space-y-1">
              <div className="text-xs font-medium text-foreground mb-1">Column Recognition:</div>
              <div className="flex flex-wrap gap-1">
                {matchedColumns.slice(0, showAllColumns ? undefined : 6).map((col, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 gap-1">
                    <Check className="w-3 h-3" />
                    {col.csvHeader} → {col.displayName}
                  </Badge>
                ))}
                {unmatchedColumns.slice(0, showAllColumns ? undefined : 3).map((col, i) => (
                  <Badge key={`u-${i}`} variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20 gap-1">
                    <X className="w-3 h-3" />
                    {col}
                  </Badge>
                ))}
              </div>
              {!showAllColumns && (matchedColumns.length > 6 || unmatchedColumns.length > 3) && (
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setShowAllColumns(true)}>
                  Show all columns...
                </Button>
              )}
              {showAllColumns && (
                <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground" onClick={() => setShowAllColumns(false)}>
                  Show less
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Data textarea */}
      <Textarea 
        placeholder={format === 'csv' 
          ? `club_name,instagram,city,country,courts,followers\nPadel Club One,@padelclub1,Cape Town,South Africa,4,5000\nPadel Club Two,@padelclub2,Johannesburg,South Africa,6,12000`
          : `[\n  {\n    "name": "Padel Club One",\n    "instagram": "@padelclub1",\n    "city": "Cape Town",\n    "followers": 5000\n  }\n]`
        }
        value={rawData}
        onChange={(e) => {
          setRawData(e.target.value);
          setFileInfo(null);
          setMatchedColumns([]);
          setUnmatchedColumns([]);
        }}
        className="flex-1 min-h-[150px] font-mono text-sm"
      />
      
      {parseError && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="w-4 h-4" />
          {parseError}
        </div>
      )}
      
      <Button onClick={() => handleParse(format)} disabled={!rawData.trim() || isExtractingLocations}>
        {isExtractingLocations ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Extracting locations...
          </>
        ) : (
          'Preview Import'
        )}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
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
          <Tabs defaultValue="csv" className="flex-1 flex flex-col overflow-hidden">
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
            
            <TabsContent value="csv" className="flex-1 flex flex-col gap-4 overflow-hidden">
              {renderInputStep('csv')}
            </TabsContent>
            
            <TabsContent value="json" className="flex-1 flex flex-col gap-4 overflow-hidden">
              {renderInputStep('json')}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Summary stats */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="font-medium">{newClubs.length} new clubs</span>
              </div>
              {duplicates.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{duplicates.length} duplicates (will be skipped)</span>
                </div>
              )}
              {columnsWithData.length > 0 && (
                <div className="text-xs text-muted-foreground ml-auto">
                  {columnsWithData.length} fields detected
                </div>
              )}
            </div>

            {/* Dynamic preview table */}
            <ScrollArea className="flex-1 border rounded-lg">
              <Table>
                <TableHeader className="bg-muted sticky top-0">
                  <TableRow>
                    {displayColumns.map(col => (
                      <TableHead key={col} className="whitespace-nowrap">
                        {getFieldDisplayName(col)}
                      </TableHead>
                    ))}
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap text-right">Fields</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedClubs.map((club, i) => {
                    const filledCount = getFilledFieldsCount(club);
                    return (
                      <TableRow 
                        key={i} 
                        className={cn(club.isDuplicate && 'opacity-50 bg-warning/5')}
                      >
                        {displayColumns.map(col => (
                          <TableCell key={col} className="whitespace-nowrap max-w-[200px] truncate">
                            {col === 'instagram_handle' && club.instagram_handle ? `@${club.instagram_handle}` : getDisplayValue(club, col)}
                            {col === 'club_name' && club.detectedOwnership && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Building2 className="w-3 h-3 text-primary inline ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>{club.detectedOwnership}</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </TableCell>
                        ))}
                        <TableCell>
                          {club.isDuplicate ? (
                            <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">Duplicate</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">New</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs text-muted-foreground">
                            {filledCount}/{ALL_IMPORT_FIELDS.length}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Hidden columns indicator */}
            {hiddenColumnsCount > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                +{hiddenColumnsCount} more fields not shown in preview
              </div>
            )}

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
