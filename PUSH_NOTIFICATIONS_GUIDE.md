# Push Notifications Implementation Guide

Ce guide explique comment configurer et utiliser le système de notifications push dans YamoZone.

## 📋 Prérequis

### 1. Installation des dépendances

```bash
npm install web-push
npm install @types/web-push --save-dev
```

### 2. Génération des clés VAPID

```bash
npx web-push generate-vapid-keys
```

### 3. Variables d'environnement

Ajoutez les clés VAPID dans votre fichier `.env.local` :

```env
# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_EMAIL=your_email@example.com
```

## 🚀 Configuration

### 1. Service Worker

Le service worker est déjà créé dans `/public/push-sw.js`. Il gère :
- Réception des notifications push
- Actions sur les notifications (ouverture d'URL)
- Gestion des événements de clic

### 2. Hook de gestion

Le hook `usePushNotifications` est disponible dans `/hooks/usePushNotifications.ts` et fournit :
- `isSupported` : Vérification du support des notifications
- `permission` : État des permissions
- `isSubscribed` : État de l'abonnement
- `subscribe()` : S'abonner aux notifications
- `unsubscribe()` : Se désabonner
- `requestPermission()` : Demander les permissions

### 3. API Routes

Les routes API sont créées dans `/api/notifications/` :
- `POST /api/notifications/subscribe` : Abonnement
- `POST /api/notifications/unsubscribe` : Désabonnement  
- `POST /api/notifications/send` : Envoi de notifications

### 4. Service de notifications

La classe `NotificationService` dans `/services/notificationService.ts` fournit :
- `sendWelcomeNotification()` : Notification de bienvenue
- `sendMessageNotification()` : Notification de message
- `sendLikeNotification()` : Notification de like
- `sendCommentNotification()` : Notification de commentaire
- `sendReEngagementNotification()` : Notification de ré-engagement
- `sendPromotionalNotification()` : Notification promotionnelle

## 💾 Stockage des abonnements

### Structure de données recommandée

```typescript
interface PushSubscription {
  id: string
  userId: string
  endpoint: string
  p256dh: string
  auth: string
  userAgent: string
  createdAt: Date
  lastUsed: Date
  isActive: boolean
}
```

### Base de données

Créez une table pour stocker les abonnements :

```sql
CREATE TABLE push_subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  
  INDEX idx_user_id (user_id),
  INDEX idx_active (is_active)
);
```

## 🔧 Intégration dans l'application

### 1. Initialisation

Dans votre layout principal ou composant racine :

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications'

export default function App() {
  const { requestPermission } = usePushNotifications()
  
  // Demander les permissions au premier lancement
  useEffect(() => {
    const hasAskedPermission = localStorage.getItem('push-permission-asked')
    if (!hasAskedPermission) {
      requestPermission()
      localStorage.setItem('push-permission-asked', 'true')
    }
  }, [])
  
  return <YourApp />
}
```

### 2. Paramètres utilisateur

Utilisez le composant `NotificationSettings` :

```typescript
import NotificationSettings from '@/components/NotificationSettings'

export default function SettingsPage() {
  return (
    <div>
      <h1>Paramètres</h1>
      <NotificationSettings />
    </div>
  )
}
```

### 3. Déclenchement des notifications

#### Notification de message

```typescript
import { NotificationService } from '@/services/notificationService'

// Quand un message est reçu
await NotificationService.sendMessageNotification(
  receiverUserId,
  senderName,
  messagePreview
)
```

#### Notification de like

```typescript
// Quand un post est liké
await NotificationService.sendLikeNotification(
  postOwnerId,
  likerName,
  postTitle
)
```

#### Notification de commentaire

```typescript
// Quand un commentaire est ajouté
await NotificationService.sendCommentNotification(
  postOwnerId,
  commenterName,
  commentPreview,
  postTitle
)
```

### 4. Notifications automatiques

#### Notification de bienvenue

```typescript
// Après inscription d'un nouvel utilisateur
await NotificationService.sendWelcomeNotification(newUserId)
```

#### Notifications de ré-engagement

```typescript
// Pour les utilisateurs inactifs (via cron job)
const inactiveUsers = await getInactiveUsers() // 7+ jours sans activité
await NotificationService.sendReEngagementNotification(
  inactiveUsers.map(u => u.id)
)
```

#### Notifications promotionnelles

```typescript
// Campagnes marketing ciblées
await NotificationService.sendPromotionalNotification(
  'Nouvelles fonctionnalités ! 🚀',
  'Découvrez les dernières améliorations de YamoZone',
  '/features',
  targetUserIds // optionnel, sinon tous les utilisateurs
)
```

## 📱 Gestion des permissions

### Vérification du support

```typescript
const { isSupported, permission } = usePushNotifications()

if (!isSupported) {
  // Afficher un message d'information
  return <div>Les notifications ne sont pas supportées sur cet appareil</div>
}

if (permission === 'denied') {
  // Expliquer comment réactiver manuellement
  return <div>Notifications désactivées. Réactivez-les dans les paramètres du navigateur.</div>
}
```

### Demande de permissions

```typescript
const { requestPermission, subscribe } = usePushNotifications()

const handleEnableNotifications = async () => {
  const granted = await requestPermission()
  if (granted) {
    await subscribe()
  }
}
```

## 🎯 Stratégies de ré-engagement

### 1. Notifications basées sur l'inactivité

```typescript
// Cron job quotidien
const strategies = [
  { days: 1, message: "N'oubliez pas de checker vos nouveaux matchs ! 💕" },
  { days: 3, message: "Des profils intéressants vous attendent ! ✨" },
  { days: 7, message: "Votre communauté YamoZone vous manque ! 🏠" },
  { days: 14, message: "Nouvelles fonctionnalités disponibles ! 🚀" },
  { days: 30, message: "Offre spéciale pour votre retour ! 🎁" }
]
```

### 2. Notifications contextuelles

```typescript
// Basées sur l'activité des autres utilisateurs
const triggers = [
  'Nouveau profil dans votre zone',
  'Activité dans vos conversations',
  'Profils similaires disponibles',
  'Événements locaux à venir'
]
```

## 🔒 Sécurité et bonnes pratiques

### 1. Validation des abonnements

```typescript
// Vérifier la validité des endpoints
const isValidSubscription = (subscription: PushSubscription) => {
  return subscription.endpoint && 
         subscription.keys?.p256dh && 
         subscription.keys?.auth
}
```

### 2. Gestion des erreurs

```typescript
// Supprimer les abonnements invalides
try {
  await webpush.sendNotification(subscription, payload)
} catch (error) {
  if (error.statusCode === 410 || error.statusCode === 404) {
    // Abonnement expiré, le supprimer de la base
    await removeSubscription(subscription.id)
  }
}
```

### 3. Respect de la vie privée

- Demander le consentement avant l'abonnement
- Permettre la désinscription facile
- Ne pas spammer les utilisateurs
- Respecter les préférences de fréquence

## 📊 Métriques et analytics

### Événements à tracker

```typescript
const trackingEvents = [
  'notification_permission_requested',
  'notification_permission_granted',
  'notification_permission_denied',
  'notification_subscription_created',
  'notification_subscription_deleted',
  'notification_sent',
  'notification_delivered',
  'notification_clicked',
  'notification_dismissed'
]
```

### Dashboard admin

La page `/settings/notifications` (pour les admins) permet :
- Envoyer des notifications de test
- Voir les statistiques d'engagement
- Gérer les campagnes promotionnelles

## 🚨 Troubleshooting

### Problèmes courants

1. **Service Worker ne se charge pas**
   - Vérifier que le fichier est dans `/public/`
   - Vérifier la configuration HTTPS

2. **Permissions refusées**
   - Expliquer les bénéfices des notifications
   - Proposer de réessayer plus tard

3. **Notifications non reçues**
   - Vérifier les clés VAPID
   - Valider les abonnements en base

4. **Erreurs CORS**
   - Configurer les headers appropriés
   - Vérifier les domaines autorisés

## 📈 Optimisations

### Performance

- Batching des notifications multiples
- Cache des abonnements actifs
- Queue pour les envois massifs

### UX

- Notifications groupées par type
- Prévisualisation avant envoi
- Programmation différée

### Monitoring

- Logs des erreurs d'envoi
- Métriques de taux de clic
- A/B testing des messages

---

Ce système de notifications est maintenant prêt à être utilisé en production avec une configuration appropriée des clés VAPID et de la base de données ! 🚀
