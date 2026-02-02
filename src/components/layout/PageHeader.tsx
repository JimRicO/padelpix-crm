import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, LogOut, User, Sparkles } from 'lucide-react';
import { SmartImportDialog } from '@/components/import/SmartImportDialog';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Agenda', path: '/agenda' },
  { label: 'Clubs', path: '/' },
  { label: 'People', path: '/people' },
  { label: 'Organizations', path: '/organizations' },
  { label: 'Events', path: '/events' },
];

interface PageHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
}

export function PageHeader({ 
  searchQuery, 
  onSearchChange, 
  searchPlaceholder = 'Search...',
  actions,
}: PageHeaderProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [smartImportOpen, setSmartImportOpen] = useState(false);

  const getUserInitials = () => {
    const email = user?.email || '';
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between gap-4">
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-primary">PadelPix</h1>
        <span className="text-sm text-muted-foreground">CRM</span>
        <nav className="ml-4 flex gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Button 
                key={item.path}
                variant={isActive ? 'secondary' : 'ghost'} 
                size="sm" 
                asChild
              >
                <Link to={item.path}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Right: Actions + User Menu */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSmartImportOpen(true)}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Smart Import
        </Button>
        
        {actions}
        
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

      <SmartImportDialog 
        open={smartImportOpen} 
        onOpenChange={setSmartImportOpen} 
      />
    </header>
  );
}
