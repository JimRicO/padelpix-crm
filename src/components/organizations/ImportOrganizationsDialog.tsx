import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useBulkCreateOrganizations } from '@/hooks/useOwnershipGroups';
import { FileJson, AlertTriangle, CheckCircle, Loader2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { OrganizationType } from '@/hooks/useOwnershipGroups';

interface ImportOrganizationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedOrganization {
  name: string;
  organization_type?: OrganizationType;
  website?: string;
  instagram_handle?: string;
  country?: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  relationship_status?: string;
  total_clubs?: number;
}

const EXAMPLE_JSON = `[
  {
    "name": "Africa Padel",
    "organization_type": "commercial",
    "website": "https://africapadel.com",
    "country": "South Africa",
    "contact_email": "john@africapadel.com"
  },
  {
    "name": "Padel SA Federation",
    "organization_type": "association",
    "address": "123 Main St, Cape Town",
    "country": "South Africa"
  }
]`;

// Helper to extract country from address
const extractCountryFromAddress = (address: string): string | null => {
  const countryPatterns: Record<string, string> = {
    'switzerland': 'Switzerland',
    'spain': 'Spain',
    'argentina': 'Argentina',
    'united states': 'United States',
    'usa': 'United States',
    'italy': 'Italy',
    'france': 'France',
    'brazil': 'Brazil',
    'mexico': 'Mexico',
    'méxico': 'Mexico',
    'united kingdom': 'United Kingdom',
    'uk': 'United Kingdom',
    'south africa': 'South Africa',
  };
  
  const lower = address.toLowerCase();
  for (const [pattern, country] of Object.entries(countryPatterns)) {
    if (lower.includes(pattern)) {
      return country;
    }
  }
  return null;
};

// Transform the nested format to flat format
const transformNestedFormat = (data: unknown): ParsedOrganization[] => {
  const result: ParsedOrganization[] = [];
  
  if (typeof data !== 'object' || data === null) {
    return result;
  }
  
  const obj = data as Record<string, unknown>;
  
  // Check for international_organizations and national_organizations arrays
  const arrays = ['international_organizations', 'national_organizations'];
  
  for (const key of arrays) {
    const arr = obj[key];
    if (Array.isArray(arr)) {
      for (const item of arr) {
        if (typeof item === 'object' && item !== null) {
          const org = item as Record<string, unknown>;
          const contacts = (org.contact_details || {}) as Record<string, unknown>;
          
          const address = typeof org.headquarters_address === 'string' ? org.headquarters_address : undefined;
          const country = address ? extractCountryFromAddress(address) : null;
          
          result.push({
            name: typeof org.official_name === 'string' ? org.official_name : '',
            organization_type: 'association',
            website: typeof contacts.website === 'string' ? contacts.website : undefined,
            address,
            country: country || 'South Africa',
            contact_email: typeof contacts.email_address === 'string' ? contacts.email_address : undefined,
            contact_phone: typeof contacts.phone_number === 'string' ? contacts.phone_number : undefined,
            relationship_status: 'prospect',
          });
        }
      }
    }
  }
  
  return result;
};

export function ImportOrganizationsDialog({ open, onOpenChange }: ImportOrganizationsDialogProps) {
  const [rawData, setRawData] = useState('');
  const [parsedOrgs, setParsedOrgs] = useState<ParsedOrganization[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');

  const bulkCreate = useBulkCreateOrganizations();

  const parseJSON = (text: string): ParsedOrganization[] => {
    const parsed = JSON.parse(text);
    
    // Handle nested format with international_organizations/national_organizations
    if (!Array.isArray(parsed) && typeof parsed === 'object') {
      const transformed = transformNestedFormat(parsed);
      if (transformed.length > 0) {
        return transformed;
      }
      throw new Error('JSON must be an array of organizations or contain international_organizations/national_organizations');
    }

    if (!Array.isArray(parsed)) {
      throw new Error('JSON must be an array of organizations');
    }

    return parsed.map((item, index) => {
      if (!item.name || typeof item.name !== 'string') {
        throw new Error(`Organization at index ${index} is missing a valid "name" field`);
      }

      return {
        name: item.name.trim(),
        organization_type: item.organization_type || 'commercial',
        website: item.website?.trim() || undefined,
        instagram_handle: item.instagram_handle?.trim() || undefined,
        country: item.country?.trim() || 'South Africa',
        address: item.address?.trim() || undefined,
        contact_name: item.contact_name?.trim() || undefined,
        contact_email: item.contact_email?.trim() || undefined,
        contact_phone: item.contact_phone?.trim() || undefined,
        notes: item.notes?.trim() || undefined,
        relationship_status: item.relationship_status?.trim() || 'prospect',
        total_clubs: typeof item.total_clubs === 'number' ? item.total_clubs : undefined,
      };
    });
  };

  const handleParse = () => {
    try {
      setParseError(null);
      const orgs = parseJSON(rawData);
      
      if (orgs.length === 0) {
        throw new Error('No organizations found in JSON');
      }

      setParsedOrgs(orgs);
      setStep('preview');
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON format');
      setParsedOrgs([]);
    }
  };

  const handleImport = () => {
    bulkCreate.mutate(parsedOrgs, {
      onSuccess: () => {
        onOpenChange(false);
        resetDialog();
      },
    });
  };

  const resetDialog = () => {
    setRawData('');
    setParsedOrgs([]);
    setParseError(null);
    setStep('input');
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetDialog();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-primary" />
            Import Organizations
          </DialogTitle>
          <DialogDescription>
            Paste a JSON array to bulk import organizations
          </DialogDescription>
        </DialogHeader>

        {step === 'input' && (
          <div className="space-y-4 flex-1 overflow-auto">
            <div className="space-y-2">
              <Label>JSON Data</Label>
              <Textarea
                value={rawData}
                onChange={(e) => setRawData(e.target.value)}
                placeholder={EXAMPLE_JSON}
                className="min-h-[300px] font-mono text-sm neu-pressed"
              />
            </div>

            {parseError && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-sm">{parseError}</span>
              </div>
            )}

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Supported Fields</h4>
              <div className="flex flex-wrap gap-1.5">
                {['name*', 'organization_type', 'website', 'instagram_handle', 'country', 'address', 'contact_name', 'contact_email', 'contact_phone', 'notes', 'relationship_status', 'total_clubs'].map(field => (
                  <Badge key={field} variant="secondary" className="text-xs">
                    {field}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                * Required field. Also supports nested format with international_organizations/national_organizations arrays.
                * Required field. organization_type can be "commercial" or "association"
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleParse} disabled={!rawData.trim()}>
                Parse & Preview
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">
                {parsedOrgs.length} organization{parsedOrgs.length !== 1 ? 's' : ''} ready to import
              </span>
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              <div className="p-4 space-y-3">
                {parsedOrgs.map((org, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "p-3 rounded-lg border bg-card",
                      "flex items-start gap-3"
                    )}
                  >
                    <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{org.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {org.organization_type === 'association' ? 'Association' : 'Commercial'}
                        </Badge>
                        {org.country && (
                          <Badge variant="secondary" className="text-xs">
                            {org.country}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 space-x-3">
                        {org.website && <span>{org.website}</span>}
                        {org.contact_email && <span>{org.contact_email}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep('input')}>
                Back
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={bulkCreate.isPending}
              >
                {bulkCreate.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>Import {parsedOrgs.length} Organization{parsedOrgs.length !== 1 ? 's' : ''}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
