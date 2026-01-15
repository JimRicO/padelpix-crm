import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Instagram, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import type { Person } from '@/types/people';
import { CONTACT_METHODS } from '@/types/people';

interface PersonCardProps {
  person: Person;
  onClick: () => void;
  suggestionsCount?: number;
  linksCount?: number;
}

export function PersonCard({ person, onClick, suggestionsCount = 0, linksCount = 0 }: PersonCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getContactMethodLabel = (method: string | null) => {
    if (!method) return null;
    const found = CONTACT_METHODS.find((m) => m.value === method);
    return found?.label || method;
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={person.profile_image || undefined} alt={person.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(person.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{person.full_name}</h3>
              {suggestionsCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {suggestionsCount} new
                </Badge>
              )}
            </div>
            {person.role && (
              <p className="text-sm text-muted-foreground">{person.role}</p>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          {person.email && (
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.instagram_handle && (
            <div className="flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 shrink-0" />
              <span>@{person.instagram_handle.replace('@', '')}</span>
            </div>
          )}
          {person.country && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span>{person.country}</span>
            </div>
          )}
        </div>

        {person.contact_date && (
          <div className="mt-3 pt-3 border-t space-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Last contact: {format(new Date(person.contact_date), 'MMM d, yyyy')}</span>
            </div>
            {person.contact_method && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Via: {getContactMethodLabel(person.contact_method)}
                  {person.contact_method === 'other' && person.contact_method_other && (
                    <> ({person.contact_method_other})</>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {linksCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="secondary" className="text-xs">
              {linksCount} linked organization{linksCount !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
