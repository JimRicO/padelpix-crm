import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Instagram, MapPin, Calendar, MessageCircle, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Person, PersonLink } from '@/types/people';
import { CONTACT_METHODS } from '@/types/people';
import { useClubs } from '@/hooks/useClubs';
import { useMemo } from 'react';

interface PersonCardProps {
  person: Person;
  onClick: () => void;
  suggestionsCount?: number;
  links?: PersonLink[];
}

export function PersonCard({ person, onClick, suggestionsCount = 0, links = [] }: PersonCardProps) {
  const { data: clubs = [] } = useClubs();

  const linkNames = useMemo(() => {
    return links.map(link => {
      if (link.link_type === 'club' && link.club_id) {
        const club = clubs.find(c => c.id === link.club_id);
        return club?.club_name || null;
      }
      if (link.link_type === 'ownership_group' && link.ownership_group_name) {
        return link.ownership_group_name;
      }
      return null;
    }).filter(Boolean) as string[];
  }, [links, clubs]);
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
      className="cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <Avatar className="card-avatar">
            <AvatarImage src={person.profile_image || undefined} alt={person.full_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(person.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="card-title">{person.full_name}</h3>
              {suggestionsCount > 0 && (
                <Badge variant="destructive" className="text-xs px-1.5 py-0">
                  {suggestionsCount} new
                </Badge>
              )}
            </div>
            {person.role && (
              <p className="card-subtitle">{person.role}</p>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-1 text-xs text-muted-foreground">
          {person.email && (
            <div className="card-meta truncate">
              <Mail className="card-icon shrink-0" />
              <span className="truncate">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="card-meta">
              <Phone className="card-icon shrink-0" />
              <span>{person.phone}</span>
            </div>
          )}
          {person.instagram_handle && (
            <div className="card-meta">
              <Instagram className="card-icon shrink-0" />
              <span>@{person.instagram_handle.replace('@', '')}</span>
            </div>
          )}
          {person.country && (
            <div className="card-meta">
              <MapPin className="card-icon shrink-0" />
              <span>{person.country}</span>
            </div>
          )}
        </div>

        {person.contact_date && (
          <div className="card-divider space-y-1 text-xs">
            <div className="card-meta">
              <Calendar className="card-icon shrink-0" />
              <span>Last contact: {format(new Date(person.contact_date), 'MMM d, yyyy')}</span>
            </div>
            {person.contact_method && (
              <div className="card-meta">
                <MessageCircle className="card-icon shrink-0" />
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

        {linkNames.length > 0 && (
          <div className="card-divider space-y-1">
            {linkNames.map((name, i) => (
              <div key={i} className="card-meta text-xs">
                <Building2 className="card-icon shrink-0" />
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
