
## Permettre de lier des Associations aux Personnes

### Problème Identifié

Le formulaire actuel affiche "Ownership Group" comme option, mais ce terme n'est plus utilisé. Les organisations sont maintenant catégorisées en:
- **Commercial** : Chaînes de clubs / groupes propriétaires
- **Association** : Fédérations et organismes non-commerciaux

La confusion vient du fait que l'option "Ownership Group" ne montre pas clairement que les associations sont incluses.

---

### Solution Proposée

**Fichier à modifier** : `src/components/people/PersonLinksTab.tsx`

1. **Renommer le type dans le sélecteur** :
   - "Ownership Group" → "Organization"

2. **Améliorer la liste déroulante** :
   - Afficher le type (Commercial/Association) à côté de chaque organisation
   - Ajouter une icône distinctive (Crown pour Commercial, Shield pour Association)

3. **Mettre à jour l'affichage des liens existants** :
   - Différencier visuellement les organisations commerciales des associations

---

### Détails Techniques

**Changements dans PersonLinksTab.tsx** :

```typescript
// Avant
<SelectItem value="ownership_group">Ownership Group</SelectItem>

// Après  
<SelectItem value="ownership_group">Organization</SelectItem>
```

**Améliorer le dropdown des organisations** :

```typescript
{ownershipGroups.map((group) => (
  <SelectItem key={group.id} value={group.name}>
    <span className="flex items-center gap-2">
      {group.organization_type === 'association' ? (
        <Shield className="w-3 h-3" />
      ) : (
        <Crown className="w-3 h-3" />
      )}
      {group.name}
    </span>
  </SelectItem>
))}
```

**Affichage des liens** : Ajouter l'icône appropriée (Crown/Shield) selon le type d'organisation liée.

---

### Impact

- Les utilisateurs verront clairement "Organization" au lieu de "Ownership Group"
- Chaque organisation dans la liste affichera son type avec une icône
- Aucun changement de base de données requis - les données existent déjà correctement
