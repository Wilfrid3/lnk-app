# Configuration Notifications Push - Architecture Séparée

## 🏗️ Architecture

- **Frontend (Next.js)** : Gestion des abonnements et interface utilisateur
- **Backend (Nest.js)** : API de notifications et logique métier

---

## 📱 **FRONTEND (Next.js) - Ce qui reste**

### 1. Service Worker & Hook (✅ Déjà créés)
- `/public/push-sw.js` - Service worker pour recevoir les notifications
- `/hooks/usePushNotifications.ts` - Hook pour gérer les abonnements
- `/components/NotificationSettings.tsx` - Interface utilisateur

### 2. Modification du Hook pour pointer vers Nest.js

```typescript
// hooks/usePushNotifications.ts - À modifier
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const subscribe = async () => {
  // ... code existant pour obtenir la subscription
  
  // Envoyer vers Nest.js au lieu de Next.js
  const response = await fetch(`${BACKEND_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // JWT token
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      userAgent: navigator.userAgent,
    }),
  })
}

const unsubscribe = async () => {
  const response = await fetch(`${BACKEND_URL}/notifications/unsubscribe`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
}
```

---

## 🚀 **BACKEND (Nest.js) - À implémenter**

### 1. Installation des dépendances

```bash
npm install web-push
npm install @types/web-push --save-dev
```

### 2. Module Notifications

```typescript
// src/notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushSubscription } from './entities/push-subscription.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PushSubscription, User])],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
```

### 3. Entity PushSubscription

```typescript
// src/notifications/entities/push-subscription.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  endpoint: string;

  @Column()
  p256dh: string;

  @Column()
  auth: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.pushSubscriptions)
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUsed: Date;
}
```

### 4. DTOs

```typescript
// src/notifications/dto/subscribe.dto.ts
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class SubscriptionKeys {
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ValidateNested()
  @Type(() => SubscriptionKeys)
  keys: SubscriptionKeys;

  @IsString()
  userAgent?: string;
}

// src/notifications/dto/send-notification.dto.ts
export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsString()
  url?: string;

  @IsArray()
  @IsOptional()
  userIds?: string[];

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  badge?: string;
}
```

### 5. Service Notifications

```typescript
// src/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as webpush from 'web-push';
import { PushSubscription } from './entities/push-subscription.entity';
import { User } from '../users/entities/user.entity';
import { SubscribeDto, SendNotificationDto } from './dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(PushSubscription)
    private pushSubscriptionRepository: Repository<PushSubscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    // Configuration VAPID
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );
  }

  async subscribe(userId: string, subscribeDto: SubscribeDto) {
    // Vérifier si l'abonnement existe déjà
    const existingSubscription = await this.pushSubscriptionRepository.findOne({
      where: { userId, endpoint: subscribeDto.endpoint },
    });

    if (existingSubscription) {
      existingSubscription.isActive = true;
      existingSubscription.lastUsed = new Date();
      return this.pushSubscriptionRepository.save(existingSubscription);
    }

    // Créer nouvel abonnement
    const subscription = this.pushSubscriptionRepository.create({
      userId,
      endpoint: subscribeDto.endpoint,
      p256dh: subscribeDto.keys.p256dh,
      auth: subscribeDto.keys.auth,
      userAgent: subscribeDto.userAgent,
    });

    return this.pushSubscriptionRepository.save(subscription);
  }

  async unsubscribe(userId: string, endpoint?: string) {
    const whereCondition = endpoint 
      ? { userId, endpoint }
      : { userId };

    await this.pushSubscriptionRepository.update(whereCondition, {
      isActive: false,
    });
  }

  async sendNotification(sendNotificationDto: SendNotificationDto) {
    const { userIds, title, body, url, icon, badge } = sendNotificationDto;

    // Récupérer les abonnements
    const subscriptions = await this.pushSubscriptionRepository.find({
      where: {
        isActive: true,
        ...(userIds && { userId: In(userIds) }),
      },
    });

    const payload = JSON.stringify({
      title,
      body,
      url: url || '/',
      icon: icon || '/icons/icon-192x192.png',
      badge: badge || '/icons/badge-72x72.png',
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload,
          );

          // Mettre à jour lastUsed
          subscription.lastUsed = new Date();
          await this.pushSubscriptionRepository.save(subscription);

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          this.logger.error(
            `Failed to send notification to ${subscription.id}:`,
            error,
          );

          // Si l'abonnement est invalide, le désactiver
          if (error.statusCode === 410 || error.statusCode === 404) {
            subscription.isActive = false;
            await this.pushSubscriptionRepository.save(subscription);
          }

          return { success: false, subscriptionId: subscription.id, error };
        }
      }),
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    this.logger.log(`Sent notifications: ${successful} successful, ${failed} failed`);

    return { successful, failed, total: results.length };
  }

  // Méthodes spécifiques pour différents types de notifications
  async sendWelcomeNotification(userId: string) {
    return this.sendNotification({
      title: '🎉 Bienvenue sur yamohub !',
      body: 'Votre profil est maintenant actif. Commencez à explorer !',
      url: '/trending',
      userIds: [userId],
    });
  }

  async sendMessageNotification(receiverUserId: string, senderName: string, messagePreview: string) {
    return this.sendNotification({
      title: `💬 Nouveau message de ${senderName}`,
      body: messagePreview,
      url: '/messages',
      userIds: [receiverUserId],
    });
  }

  async sendLikeNotification(postOwnerId: string, likerName: string, postTitle: string) {
    return this.sendNotification({
      title: `❤️ ${likerName} a aimé votre post`,
      body: postTitle,
      url: '/posts',
      userIds: [postOwnerId],
    });
  }

  async sendCommentNotification(postOwnerId: string, commenterName: string, commentPreview: string, postTitle: string) {
    return this.sendNotification({
      title: `💬 ${commenterName} a commenté`,
      body: `"${commentPreview}" sur "${postTitle}"`,
      url: '/posts',
      userIds: [postOwnerId],
    });
  }

  async sendReEngagementNotification(userIds: string[]) {
    const messages = [
      { title: '🔥 Votre communauté vous manque !', body: 'Découvrez les nouveaux profils dans votre zone' },
      { title: '✨ Nouveautés disponibles', body: 'De nouvelles fonctionnalités vous attendent' },
      { title: '💕 Vos matchs vous attendent', body: 'Quelqu\'un attend peut-être votre message' },
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    return this.sendNotification({
      ...randomMessage,
      url: '/trending',
      userIds,
    });
  }

  async sendPromotionalNotification(title: string, body: string, url: string, userIds?: string[]) {
    return this.sendNotification({
      title,
      body,
      url,
      userIds,
    });
  }
}
```

### 6. Controller

```typescript
// src/notifications/notifications.controller.ts
import { Controller, Post, Body, UseGuards, Request, Delete, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { SubscribeDto, SendNotificationDto } from './dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('subscribe')
  async subscribe(@Request() req, @Body() subscribeDto: SubscribeDto) {
    return this.notificationsService.subscribe(req.user.id, subscribeDto);
  }

  @Post('unsubscribe')
  async unsubscribe(@Request() req, @Body() body?: { endpoint?: string }) {
    return this.notificationsService.unsubscribe(req.user.id, body?.endpoint);
  }

  @Post('send')
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    // Optionnel: ajouter des vérifications d'autorisation admin
    return this.notificationsService.sendNotification(sendNotificationDto);
  }

  @Get('test-welcome')
  async testWelcome(@Request() req) {
    return this.notificationsService.sendWelcomeNotification(req.user.id);
  }
}
```

### 7. Variables d'environnement (Nest.js)

```env
# .env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your-email@example.com
```

### 8. Intégration dans d'autres services

```typescript
// src/messages/messages.service.ts
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MessagesService {
  constructor(
    private notificationsService: NotificationsService,
  ) {}

  async sendMessage(senderId: string, receiverId: string, content: string) {
    // Logique d'envoi du message...
    
    // Envoyer notification
    const sender = await this.userService.findOne(senderId);
    await this.notificationsService.sendMessageNotification(
      receiverId,
      sender.name,
      content.substring(0, 50) + '...'
    );
  }
}

// src/posts/posts.service.ts
async likePost(postId: string, userId: string) {
  // Logique de like...
  
  // Envoyer notification au propriétaire du post
  const post = await this.findOne(postId);
  const liker = await this.userService.findOne(userId);
  
  if (post.userId !== userId) { // Ne pas notifier soi-même
    await this.notificationsService.sendLikeNotification(
      post.userId,
      liker.name,
      post.title
    );
  }
}
```

---

## 🔄 **Actions à faire**

### Dans Next.js :
1. ❌ **Supprimer** `/src/app/api/notifications/` (plus nécessaire)
2. ✅ **Modifier** le hook pour pointer vers Nest.js
3. ✅ **Garder** le service worker et les composants UI

### Dans Nest.js :
1. ✅ **Installer** `web-push`
2. ✅ **Créer** le module notifications complet
3. ✅ **Ajouter** les variables VAPID
4. ✅ **Intégrer** dans vos services existants

Voulez-vous que je supprime les API routes Next.js et modifie le hook pour pointer vers votre backend Nest.js ?
