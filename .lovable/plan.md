

## Ajouter la Recherche Autocomplete pour les Organisations

Actuellement, le sélecteur d'organisations utilise un simple `Select` qui affiche toute la liste. Je vais le remplacer par un composant de recherche autocomplete (combobox) qui permet de taper pour filtrer.

---

### Pattern Existant

Le projet utilise déjà ce pattern dans `ClubInfoTab.tsx` pour sélectionner un groupe de propriété. Je vais réutiliser cette approche :

```text
┌─────────────────────────────────────────────┐
│ 🔍 Type to search...                        │
├─────────────────────────────────────────────┤
│ 👑 Africa Padel Group                       │
│ 🛡️ South African Padel Federation          │
│ 👑 Urban Padel Holdings                     │
│ ─────────────────────────────────────────── │
│ ➕ Create New Organization                  │
└─────────────────────────────────────────────┘
```

---

### Fichier à Modifier

**`src/components/people/PersonLinksTab.tsx`**

---

### Changements Techniques

1. **Nouveaux imports**
   - Ajouter `Popover`, `PopoverTrigger`, `PopoverContent`
   - Ajouter `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`
   - Ajouter `Check`, `ChevronsUpDown` de lucide-react

2. **Nouveau state**
   - `organizationOpen` : boolean pour contrôler l'ouverture du popover
   - `organizationSearch` : string pour la valeur de recherche (optionnel, car cmdk filtre automatiquement)

3. **Remplacer le Select par un Combobox**
   - Utiliser `Popover` + `Command` au lieu de `Select`
   - `CommandInput` pour la zone de recherche
   - `CommandList` avec `CommandGroup` pour les organisations filtrées
   - `CommandEmpty` pour afficher un message quand aucun résultat
   - Conserver l'option "Create New Organization" en bas de la liste

4. **Appliquer le même pattern pour les clubs**
   - Pour cohérence, remplacer aussi le sélecteur de clubs par un combobox searchable

---

### Comportement Attendu

- L'utilisateur clique sur le bouton combobox
- Un popover s'ouvre avec un champ de recherche
- En tapant, les organisations sont filtrées en temps réel (géré automatiquement par `cmdk`)
- Chaque organisation affiche son icône (Crown/Shield) selon son type
- L'option "Create New Organization" reste toujours visible en bas
- Cliquer sur une organisation la sélectionne et ferme le popover

