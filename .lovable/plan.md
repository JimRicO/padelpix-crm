
## Rendre les Liens Cliquables dans les Cartes Personnes

Actuellement, les liens vers les organisations et clubs sont affichés mais non interactifs. Cette modification permettra aux utilisateurs de cliquer sur un lien pour ouvrir directement la fiche détaillée correspondante.

---

### Solution

**Fichier à modifier** : `src/components/people/PersonLinksTab.tsx`

### Changements

1. **Ajouter les imports nécessaires**
   - `ClubDetailModal` pour afficher les détails des clubs
   - `OwnershipGroupModal` pour afficher les détails des organisations
   - Type `Club` pour typer correctement le state

2. **Ajouter deux nouveaux états**
   - `selectedClub`: pour stocker le club sélectionné (objet Club complet)
   - `selectedOrganization`: pour stocker le nom de l'organisation sélectionnée (string)

3. **Rendre les noms cliquables**
   - Transformer le texte du nom en bouton avec style de lien
   - Ajouter `cursor-pointer` et `hover:underline` pour indiquer l'interactivité
   - Au clic, définir l'état correspondant pour ouvrir le modal

4. **Ajouter les modals**
   - `ClubDetailModal` contrôlé par `selectedClub`
   - `OwnershipGroupModal` contrôlé par `selectedOrganization`

---

### Exemple de Code

**Pour les liens clubs :**
```text
┌─────────────────────────────────────────────────┐
│ 🏢  Club Padel Johannesburg    ⭐ Primary    🗑️ │
│     └── Manager                                 │
└─────────────────────────────────────────────────┘
       ↑
       Cliquable → Ouvre ClubDetailModal
```

**Pour les liens organisations :**
```text
┌─────────────────────────────────────────────────┐
│ 👑  Africa Padel Group         ⭐ Primary    🗑️ │
│     └── Director                                │
└─────────────────────────────────────────────────┘
       ↑
       Cliquable → Ouvre OwnershipGroupModal
```

---

### Détails Techniques

```typescript
// Nouveaux états
const [selectedClub, setSelectedClub] = useState<Club | null>(null);
const [selectedOrganization, setSelectedOrganization] = useState<string | null>(null);

// Gestionnaire de clic pour club
const handleClubClick = (clubId: string) => {
  const club = clubs.find(c => c.id === clubId);
  if (club) setSelectedClub(club);
};

// Gestionnaire de clic pour organisation
const handleOrganizationClick = (groupName: string) => {
  setSelectedOrganization(groupName);
};
```

**Rendu du nom cliquable :**
```tsx
<span 
  className="font-medium cursor-pointer hover:underline hover:text-primary"
  onClick={(e) => {
    e.stopPropagation();
    if (link.link_type === 'club') {
      handleClubClick(link.club_id!);
    } else {
      handleOrganizationClick(link.ownership_group_name!);
    }
  }}
>
  {link.link_type === 'club' 
    ? getClubName(link.club_id) 
    : link.ownership_group_name}
</span>
```

---

### Résultat Attendu

- L'utilisateur voit les liens avec un style indiquant qu'ils sont cliquables
- Au survol, le nom s'affiche souligné
- Au clic sur un club → le modal Club s'ouvre
- Au clic sur une organisation → le modal Organisation s'ouvre
- Les deux modals sont indépendants du modal Person (superposition possible)
