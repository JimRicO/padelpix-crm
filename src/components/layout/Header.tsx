import { useAuth } from '@/hooks/useAuth';
import { useClubs } from '@/hooks/useClubs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Plus, Upload, Download, LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClub: () => void;
  onImport: () => void;
}

export function Header({ searchQuery, onSearchChange, onAddClub, onImport }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { data: clubs = [] } = useClubs();

  const getUserInitials = () => {
    const email = user?.email || '';
    return email.slice(0, 2).toUpperCase();
  };

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
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-primary">PadelPix</h1>
        <span className="text-sm text-muted-foreground">CRM</span>
        <div className="ml-4 flex gap-2">
          <Button variant="secondary" size="sm">Clubs</Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/people">People</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <a href="/organizations">Groups</a>
          </Button>
        </div>
      </div>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
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
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <User className="w-4 h-4" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive">
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
