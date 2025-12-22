# Guide des Mises à Jour Automatiques

## Vue d'ensemble

Ce système permet aux utilisateurs de recevoir les dernières mises à jour sans avoir besoin de rafraîchir manuellement ou vider le cache. Les modifications déployées s'appliquent automatiquement sur les téléphones des utilisateurs.

## Comment ça fonctionne

### 1. **Détection des mises à jour**
- Le hook `useServiceWorkerUpdate` vérifie périodiquement (toutes les heures) si une nouvelle version est disponible
- Il compare la version actuellement en cache avec la nouvelle version sur le serveur
- Quand une mise à jour est détectée, une notification s'affiche

### 2. **Notification utilisateur**
- Un composant `UpdateNotification` affiche une bannière en bas de l'écran
- L'utilisateur peut choisir de mettre à jour immédiatement ou plus tard
- L'icône d'horloge indique que la mise à jour est en cours

### 3. **Installation automatique**
- Quand l'utilisateur clique sur "Mettre à jour", le nouveau Service Worker s'active
- La page se recharge automatiquement avec les nouvelles modifications
- L'utilisateur bénéficie immédiatement des nouvelles fonctionnalités

## Architecture

### Fichiers clés

```
src/
├── hooks/
│   └── useServiceWorkerUpdate.ts      # Hook de détection des mises à jour
├── components/
│   └── UpdateNotification.tsx          # UI de notification
├── app/
│   ├── api/
│   │   └── version/route.ts           # Endpoint pour vérifier la version
│   └── layout.tsx                     # Layout avec UpdateNotification
public/
├── sw-update.js                       # Service Worker personnalisé
└── sw.js                              # Service Worker généré par Workbox
```

## Déploiement

### Avant de déployer

1. **Mettre à jour la version** dans votre CI/CD pipeline :
   ```bash
   export NEXT_PUBLIC_APP_VERSION=$(git rev-parse --short HEAD)-$(date +%s)
   # ou
   export NEXT_PUBLIC_BUILD_ID=$(date +%Y%m%d%H%M%S)
   ```

2. **Build et test localement** :
   ```bash
   npm run build
   npm start
   ```

### Lors du déploiement

1. **Servir le nouveau build** avec les headers de non-cache pour `/api/version`
2. **Ne pas modifier les anciens fichiers statiques** (images, CSS) - les anciens clients peuvent encore les utiliser
3. **Assurer que la nouvelle version est accessible** avant de mettre à jour les DNS

### Configuration du serveur

L'API `/api/version` retourne :
```json
{
  "version": "abc1234-1703264400",
  "timestamp": "2024-12-22T10:00:00Z",
  "buildId": "20241222100000"
}
```

Cette réponse est **jamais cachée** (max-age=0).

## Comportement utilisateur

1. **Aucune action nécessaire** - Les utilisateurs sont notifiés automatiquement
2. **Notification discrète** - La bannière apparaît en bas de l'écran, non intrusive
3. **Contrôle de l'utilisateur** - L'utilisateur peut repousser la mise à jour s'il est occupé
4. **Mise à jour sans rechargement** - Une fois acceptée, la page recharge avec les nouvelles données

## Optimisations

### Cache-Control Headers
- **Images** : Cache 1 an (immutable)
- **/api/version** : Jamais en cache (max-age=0)
- **HTML/JS** : Cache normal avec validation

### Service Worker
- **skipWaiting: true** - Activation immédiate du nouveau SW
- **clientsClaim** - Prise de contrôle immédiate de tous les clients
- **Vérification horaire** - Équilibre entre fraîcheur et impact batterie

## Variables d'environnement

Définissez ces variables dans votre pipeline de déploiement :

```bash
NEXT_PUBLIC_APP_VERSION=your-version-string
NEXT_PUBLIC_BUILD_ID=your-build-id
```

Si non définis, un timestamp sera utilisé automatiquement.

## Vérification du fonctionnement

### En développement
```bash
npm run build
npm start
# Ouvrir DevTools > Application > Service Workers
# Vérifier que le SW est "activated and running"
```

### En production
1. Déployer une nouvelle version
2. Ouvrir l'app sur un téléphone
3. Attendre quelques minutes ou forcer une vérification
4. La notification devrait apparaître
5. Cliquer "Mettre à jour" et voir la page recharger

## Dépannage

### La notification n'apparaît pas
- Vérifier que le Service Worker est actif : DevTools > Application > Service Workers
- Vérifier les logs en console
- S'assurer que `/api/version` retourne une version différente

### La page ne recharge pas après mise à jour
- Vérifier que `skipWaiting` est `true` dans next.config.js
- Vérifier que le nouveau Service Worker est bien "activated"

### Les anciens utilisateurs restent sur l'ancienne version
- C'est normal si l'utilisateur n'ouvre pas l'app
- Une fois que l'app est ouverte, la notification apparaîtra
- L'utilisateur doit cliquer "Mettre à jour" pour activer la nouvelle version

## Notes importantes

1. **Les caches sont conservés** - Les utilisateurs ne perdent pas leurs données en cache
2. **Déploiements fréquents** - Vous pouvez déployer plusieurs fois par jour
3. **Rollback possible** - Si nécessaire, re-déployer une ancienne version
4. **Pas d'interruption** - L'utilisateur n'est jamais forcé de mettre à jour immédiatement
