

## Compléter le Formulaire "Add Organization"

Le formulaire actuel n'a que 2 champs (Nom et Type). Je vais l'aligner sur le formulaire "Add Club" qui a une structure complète.

---

### Structure du Nouveau Formulaire

```text
┌────────────────────────────────────────────────────┐
│              Add Organization                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Organization Name *                               │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Type                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Commercial]        [Association]           │   │
│  └─────────────────────────────────────────────┘   │
│                                                    │
│  [Instagram Handle    ] [Website               ]   │
│  [@handle             ] [https://              ]   │
│                                                    │
│  [Country             ] [Relationship Status   ]   │
│  [South Africa        ] [Select status...      ]   │
│                                                    │
│  [Contact Name        ] [Contact Email         ]   │
│  [                    ] [                      ]   │
│                                                    │
│  [Contact Phone       ]                            │
│  [+27...              ]                            │
│                                                    │
│  Notes                                             │
│  ┌──────────────────────────────────────────────┐  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│                      [Cancel]  [Create Organization]│
└────────────────────────────────────────────────────┘
```

---

### Champs à Ajouter

| Champ | Type | Exemple |
|-------|------|---------|
| `instagram_handle` | Text | @africapadel |
| `website` | URL | https://africapadel.com |
| `country` | Text | South Africa |
| `relationship_status` | Select | Active / Prospect / Inactive |
| `contact_name` | Text | John Smith |
| `contact_email` | Email | john@company.com |
| `contact_phone` | Tel | +27 82 123 4567 |
| `notes` | Textarea | Notes diverses |

---

### Fichier à Modifier

**`src/components/organizations/AddOrganizationDialog.tsx`**

Transformer le formulaire minimal en formulaire complet :

1. Ajouter `formData` state object (comme dans AddClubDialog)
2. Ajouter les champs de formulaire en grille 2 colonnes
3. Garder le sélecteur de type neumorphique existant
4. Ajouter un Select pour `relationship_status`
5. Ajouter un Textarea pour `notes`
6. Passer toutes les valeurs au hook `createGroup.mutate()`

---

### Constantes pour Relationship Status

```typescript
const RELATIONSHIP_STATUSES = [
  { value: 'prospect', label: 'Prospect' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'churned', label: 'Churned' },
] as const;
```

