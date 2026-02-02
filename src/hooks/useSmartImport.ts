import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBulkCreateClubs } from './useClubs';
import { useBulkCreateOrganizations } from './useOwnershipGroups';
import { useBulkCreatePeople } from './usePeople';
import { toast } from 'sonner';

export type EntityType = 'club' | 'organization' | 'person';
export type ImportStep = 'input' | 'processing' | 'preview';

export interface NormalizedResult {
  success: boolean;
  entity_type: EntityType;
  confidence: 'high' | 'medium' | 'low';
  records: Record<string, unknown>[];
  field_mappings: Record<string, string>;
  unmapped_fields: string[];
  warnings: string[];
  error?: string;
}

export function useSmartImport() {
  const [step, setStep] = useState<ImportStep>('input');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<NormalizedResult | null>(null);
  const [rawInput, setRawInput] = useState('');
  
  const bulkCreateClubs = useBulkCreateClubs();
  const bulkCreateOrganizations = useBulkCreateOrganizations();
  const bulkCreatePeople = useBulkCreatePeople();

  const detectFormat = (input: string): 'json' | 'csv' | 'text' => {
    const trimmed = input.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        return 'text';
      }
    }
    // Check for CSV-like structure (has commas and newlines)
    if (trimmed.includes(',') && trimmed.includes('\n')) {
      const lines = trimmed.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        const firstLineCommas = (lines[0].match(/,/g) || []).length;
        const secondLineCommas = (lines[1].match(/,/g) || []).length;
        if (firstLineCommas > 0 && firstLineCommas === secondLineCommas) {
          return 'csv';
        }
      }
    }
    return 'text';
  };

  const analyzeData = async (input: string) => {
    if (!input.trim()) {
      toast.error('Please enter some data to analyze');
      return;
    }

    setRawInput(input);
    setStep('processing');
    setIsProcessing(true);

    try {
      const dataFormat = detectFormat(input);
      console.log(`Detected format: ${dataFormat}`);

      const { data, error } = await supabase.functions.invoke('normalize-data', {
        body: { rawData: input, dataFormat },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to normalize data');
      }

      setResult(data as NormalizedResult);
      setStep('preview');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to analyze data');
      setStep('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const importRecords = async () => {
    if (!result || result.records.length === 0) {
      toast.error('No records to import');
      return;
    }

    setIsProcessing(true);

    try {
      switch (result.entity_type) {
        case 'club':
          await bulkCreateClubs.mutateAsync(result.records.map(r => ({
            club_name: r.club_name as string,
            instagram_handle: r.instagram_handle as string | undefined,
            city: r.city as string | undefined,
            country: r.country as string | undefined,
            suburb: r.suburb as string | undefined,
            address: r.address as string | undefined,
            phone: r.phone as string | undefined,
            email: r.email as string | undefined,
            website: r.website as string | undefined,
            whatsapp: r.whatsapp as string | undefined,
            google_maps_url: r.google_maps_url as string | undefined,
            number_of_courts: r.number_of_courts as number | undefined,
            contact_name: r.contact_name as string | undefined,
            linkedin: r.linkedin as string | undefined,
            business_description: r.business_description as string | undefined,
            facebook: r.facebook as string | undefined,
            twitter: r.twitter as string | undefined,
            insta_url: r.insta_url as string | undefined,
            insta_bio: r.insta_bio as string | undefined,
            insta_followers: r.insta_followers as number | undefined,
            avg_likes: r.avg_likes as number | undefined,
            avg_comments: r.avg_comments as number | undefined,
            avg_video_views: r.avg_video_views as number | undefined,
            top_hashtags: r.top_hashtags as string[] | undefined,
            key_individuals: r.key_individuals as string[] | undefined,
            coaches: r.coaches as string[] | undefined,
            ownership_group: r.ownership_group as string | undefined,
          })));
          break;

        case 'organization':
          await bulkCreateOrganizations.mutateAsync(result.records.map(r => ({
            name: r.name as string,
            organization_type: r.organization_type as 'commercial' | 'association' | undefined,
            country: r.country as string | undefined,
            address: r.address as string | undefined,
            website: r.website as string | undefined,
            instagram_handle: r.instagram_handle as string | undefined,
            contact_name: r.contact_name as string | undefined,
            contact_email: r.contact_email as string | undefined,
            contact_phone: r.contact_phone as string | undefined,
            total_clubs: r.total_clubs as number | undefined,
            relationship_status: r.relationship_status as string | undefined,
            notes: r.notes as string | undefined,
          })));
          break;

        case 'person':
          await bulkCreatePeople.mutateAsync(result.records.map(r => ({
            full_name: r.full_name as string,
            role: r.role as string | undefined,
            email: r.email as string | undefined,
            phone: r.phone as string | undefined,
            country: r.country as string | undefined,
            instagram_handle: r.instagram_handle as string | undefined,
            linkedin: r.linkedin as string | undefined,
            notes: r.notes as string | undefined,
            profile_image: r.profile_image as string | undefined,
            contact_date: r.contact_date as string | undefined,
            contact_method: r.contact_method as string | undefined,
          })));
          break;
      }

      toast.success(`Successfully imported ${result.records.length} ${result.entity_type}${result.records.length !== 1 ? 's' : ''}`);
      reset();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import records');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setStep('input');
    setResult(null);
    setRawInput('');
    setIsProcessing(false);
  };

  const overrideEntityType = (newType: EntityType) => {
    if (result) {
      setResult({ ...result, entity_type: newType });
    }
  };

  return {
    step,
    isProcessing,
    result,
    rawInput,
    analyzeData,
    importRecords,
    reset,
    overrideEntityType,
    setStep,
  };
}
