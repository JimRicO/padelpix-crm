import { useClubs } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Upload, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from './PageHeader';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClub: () => void;
  onImport: () => void;
}

export function Header({ searchQuery, onSearchChange, onAddClub, onImport }: HeaderProps) {
  const { data: clubs = [] } = useClubs();

  const handleExport = () => {
    if (clubs.length === 0) {
      toast.error('No clubs to export');
      return;
    }

    const headers = [
      'club_name',
      'instagram_handle',
      'email',
      'whatsapp',
      'website',
      'linkedin',
      'city',
      'country',
      'address',
      'number_of_courts',
      'contact_name',
      'ownership_group',
      'pipeline_stage',
      'tier',
      'priority',
      'next_action',
      'notes',
    ];

    const escapeCSV = (value: string | number | null | undefined): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...clubs.map(club => 
        headers.map(header => escapeCSV(club[header as keyof typeof club] as string | number | null)).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clubs-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${clubs.length} clubs`);
  };

  return (
    <PageHeader
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search clubs..."
      actions={
        <>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleExport}>
            <Upload className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onImport}>
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" onClick={onAddClub}>
            <Plus className="w-4 h-4 mr-2" />
            Add Club
          </Button>
        </>
      }
    />
  );
}
