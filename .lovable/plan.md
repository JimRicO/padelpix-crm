

## Améliorer la Création d'Organisation depuis la Carte Personne

Actuellement, quand un utilisateur clique sur "Create New Organization" dans le formulaire de lien, il ne peut entrer qu'un nom. Cette modification permettra d'ouvrir le formulaire complet de création d'organisation directement depuis la carte personne.

---

### Approche Choisie

Plutôt que de dupliquer le formulaire, je vais **réutiliser le composant `AddOrganizationDialog` existant** et le modifier légèrement pour qu'il puisse retourner l'organisation créée au composant parent.

---

### Fichiers à Modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/organizations/AddOrganizationDialog.tsx` | Ajouter un callback `onOrganizationCreated` optionnel |
| `src/components/people/PersonLinksTab.tsx` | Remplacer le formulaire inline par l'ouverture du dialog complet |

---

### Changements Détaillés

#### 1. AddOrganizationDialog.tsx

Ajouter une prop optionnelle pour notifier le parent quand une organisation est créée :

```typescript
interface AddOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrganizationCreated?: (organizationName: string) => void; // Nouvelle prop
}
```

Dans `handleSubmit`, appeler ce callback après la création réussie :

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...
  
  const result = await createGroup.mutateAsync({ ... });
  
  // Notifier le parent avec le nom de l'organisation créée
  onOrganizationCreated?.(result.name);
  
  setFormData(initialFormData);
  onOpenChange(false);
};
```

#### 2. PersonLinksTab.tsx

**Supprimer** :
- L'état `isCreatingNew` et `newGroupName`
- La logique de création inline dans `handleAddLink`
- Le rendu conditionnel du formulaire inline (lignes 258-277)

**Ajouter** :
- Import de `AddOrganizationDialog`
- État `showCreateOrgDialog` pour contrôler le dialog
- Callback `handleOrganizationCreated` qui :
  - Ferme le dialog de création
  - Sélectionne automatiquement la nouvelle organisation dans le combobox

---

### Flux Utilisateur Amélioré

```text
┌─────────────────────────────────────────────────────────┐
│ Add Organization Link                                    │
├─────────────────────────────────────────────────────────┤
│ Link Type: [Organization ▼]                              │
│                                                          │
│ Select Organization: [Search organizations... ▼]         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ 🔍 Type to search...                            │   │
│   ├─────────────────────────────────────────────────┤   │
│   │ 👑 Africa Padel Group                           │   │
│   │ 🛡️ SA Padel Federation                         │   │
│   │ ─────────────────────────────────────────────── │   │
│   │ ➕ Create New Organization ◄── Clic ici         │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Add Organization (Dialog complet)                        │
├─────────────────────────────────────────────────────────┤
│ Organization Name *: [                              ]    │
│                                                          │
│ Type:  [👑 Commercial] [🛡️ Association]                 │
│                                                          │
│ Instagram: [@handle    ]  Website: [example.com     ]   │
│ Country:   [South Africa]  Status:  [Select...     ▼]   │
│ Contact:   [John Smith  ]  Email:   [email@...      ]   │
│ Phone:     [+27...      ]                               │
│ Notes:     [                                        ]   │
│                                                          │
│                        [Cancel] [Create Organization]    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼ (Après création)
┌─────────────────────────────────────────────────────────┐
│ Add Organization Link                                    │
│                                                          │
│ Select Organization: [👑 Nouvelle Organisation ▼] ◄──── │
│                       Automatiquement sélectionnée       │
└─────────────────────────────────────────────────────────┘
```

---

### Avantages

1. **Cohérence** : Le même formulaire de création est utilisé partout
2. **Fonctionnalités complètes** : Accès à tous les champs (type, contacts, etc.)
3. **Moins de code** : Suppression du formulaire inline dupliqué
4. **Meilleure UX** : L'organisation est auto-sélectionnée après création

