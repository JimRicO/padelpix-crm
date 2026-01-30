

## Ajouter le Type d'Organisation (Commercial vs Association)

### Aperçu
Ajouter un champ `organization_type` pour catégoriser les organisations comme entités commerciales (chaînes de clubs) ou associations non-commerciales (fédérations, organismes sportifs).

### Types d'Organisation

| Type | Description | Exemples |
|------|-------------|----------|
| `commercial` | Chaînes de clubs, groupes propriétaires | Virgin Active, Africa Padel, Balwin |
| `association` | Fédérations, organismes, non-profit | Padel Federation SA, World Padel Tour, Tennis SA |

---

### 1. Modification de la Base de Données

Ajouter une nouvelle colonne à la table `ownership_groups` :

```sql
ALTER TABLE ownership_groups 
ADD COLUMN organization_type TEXT DEFAULT 'commercial';

ALTER TABLE ownership_groups 
ADD CONSTRAINT organization_type_check 
CHECK (organization_type IN ('commercial', 'association'));
```

---

### 2. Dialogue de Création Amélioré

Le dialogue `AddOrganizationDialog` sera transformé avec :

**Sélecteur de Type Neumorphique :**
```text
┌────────────────────────────────────────────────────┐
│              Add Organization                       │
├────────────────────────────────────────────────────┤
│                                                    │
│  Organization Name                                 │
│  ┌──────────────────────────────────────────────┐  │
│  │ Virgin Active                                │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  Type                                              │
│  ┌─────────────────────────────────────────────┐   │
│  │ ┌─────────────────┐ ┌─────────────────────┐ │   │
│  │ │ 👑 Commercial   │ │ 🛡 Association      │ │   │
│  │ │   [SELECTED]    │ │                     │ │   │
│  │ │ Club chains &   │ │ Federations &       │ │   │
│  │ │ ownership groups│ │ governing bodies    │ │   │
│  │ └─────────────────┘ └─────────────────────┘ │   │
│  └─────────────────────────────────────────────┘   │
│                        (neu-pressed container)      │
│                                                    │
│                      [Cancel]  [Create Organization]│
└────────────────────────────────────────────────────┘
```

**Design du Sélecteur :**
- Conteneur parent avec style `neu-pressed` (effet enfoncé)
- Deux cartes côte à côte
- Carte sélectionnée : style `neu-subtle` (effet relevé) + bordure primary
- Carte non-sélectionnée : apparence plate
- Icône Crown (👑) pour Commercial, Shield (🛡) pour Association
- Description courte sous chaque option

---

### 3. Fichiers à Modifier

| Fichier | Modifications |
|---------|---------------|
| **Migration SQL** | Ajouter colonne `organization_type` |
| `src/hooks/useOwnershipGroups.ts` | Ajouter `organization_type` à l'interface et aux mutations |
| `src/components/organizations/AddOrganizationDialog.tsx` | Ajouter sélecteur de type neumorphique |
| `src/components/organizations/OrganizationCard.tsx` | Afficher badge de type avec icône différente |
| `src/components/group/OwnershipGroupModal.tsx` | Permettre modification du type dans l'onglet Contacts |
| `src/pages/Organizations.tsx` | Ajouter filtre par type (Tous / Commercial / Association) |

---

### 4. Détails Techniques

**Interface TypeScript mise à jour :**
```typescript
interface OwnershipGroup {
  // ... champs existants
  organization_type: 'commercial' | 'association' | null;
}
```

**Constantes pour les types :**
```typescript
const ORGANIZATION_TYPES = [
  { 
    value: 'commercial', 
    label: 'Commercial', 
    icon: Crown, 
    description: 'Chaînes de clubs & groupes propriétaires' 
  },
  { 
    value: 'association', 
    label: 'Association', 
    icon: Shield, 
    description: 'Fédérations & organismes sportifs' 
  },
] as const;
```

---

### 5. Différenciation Visuelle des Cartes

```text
CARTE COMMERCIAL                   CARTE ASSOCIATION
┌─────────────────────┐            ┌─────────────────────┐
│ 👑 Africa Padel     │            │ 🛡 Padel Fed SA     │
│ [Actif] [Commercial]│            │ [Actif] [Association]
│ 5 clubs • SA • 2021 │            │ 120 membres • SA    │
└─────────────────────┘            └─────────────────────┘
```

- **Commercial** : Icône Crown, badge orange/primary
- **Association** : Icône Shield, badge bleu/slate

---

### 6. Filtre sur la Page Organizations

Ajouter un sélecteur de filtre à côté du tri existant :

```text
[🔽 Type: Tous ▾] [🔽 Trier par: Nom ▾]
       │
       ├── Tous
       ├── Commercial
       └── Associations
```

---

### Résultat Attendu

Après implémentation :
- L'utilisateur choisit le type lors de la création d'une organisation
- Différenciation visuelle claire entre commercial et association
- Filtrage par type sur la page Organizations
- Les organisations existantes sont par défaut "commercial"
- Le type peut être modifié dans le modal (onglet Contacts)

