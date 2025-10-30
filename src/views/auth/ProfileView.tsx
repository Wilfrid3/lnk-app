'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DefaultLayout from '@/components/layouts/DefaultLayout'
import { useAuth } from '@/contexts/AuthContext'
import apiClient from '@/lib/axios'

interface InviteStats {
  totalInvites: number
  successfulInvites: number
  rewardsEarned: number
  currency: string
}

export default function ProfileView() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [inviteStats, setInviteStats] = useState<InviteStats>({
    totalInvites: 0,
    successfulInvites: 0,
    rewardsEarned: 0,
    currency: 'FCFA'
  });

  useEffect(() => {
    loadInviteStats();
  }, []);

  const loadInviteStats = async () => {
    try {
      const response = await apiClient.get<InviteStats>('/users/profile/invite-stats');
      setInviteStats(response.data);
    } catch (error) {
      console.error('Error loading invite stats:', error);
    }
  };

  const handleQuickShare = () => {
    if (user?.inviteCode) {
      const inviteLink = `${window.location.origin}/auth/signup?ref=${user.inviteCode}`;
      const message = `Rejoins-moi sur YamoZone avec mon code d'invitation: ${user.inviteCode}\n\nOu utilise ce lien: ${inviteLink}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Rejoignez YamoZone',
          text: message,
          url: inviteLink
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(message);
        // Could show a toast notification here
      }
    }
  };
  
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await apiClient.post('/auth/logout');
      
      // Use the AuthContext's signOut method to clear local state/storage
      await signOut();
      
      // Redirect to login page
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if the API call fails, we should still clear local state
      await signOut();
      router.push('/auth/signin');
    }
  };

  const settingGroups = [
    {
      title: "Paramètres de compte et sécurité",
      items: [
        { 
          icon: "person", 
          label: "Mes informations", 
          href: "/profile/personal-info" 
        },
        { 
          icon: "local_offer", 
          label: "Mes délires et Mes tarifs", 
          href: "/profile/preferences-rates" 
        },
        { 
          icon: "redeem", 
          label: "Mon code d'invitation", 
          href: "/profile/invite-code" 
        },
        { 
          icon: "lock", 
          label: "Mot de passe", 
          href: "/profile/password" 
        },
      ]
    },
    {
      title: "Données générales",
      items: [
        { 
          icon: "campaign", 
          label: "Mes annonces / Mes vidéos", 
          href: "/profile/posts" 
        },
        { 
          icon: "business_center", 
          label: "Compte Business et statistiques", 
          href: "/profile/business" 
        },
      ]
    },
    {
      title: "Informations supplémentaires",
      items: [
        { 
          icon: "description", 
          label: "Termes et conditions générales", 
          href: "/terms" 
        },
        { 
          icon: "privacy_tip", 
          label: "Privacy policy", 
          href: "/privacy-policy" 
        },
        { 
          icon: "mail", 
          label: "Nous contacter", 
          href: "/contact" 
        },        { 
          icon: "logout", 
          label: "Deconnexion", 
          href: "#",
          onClick: handleLogout,
          className: "text-gray-800 dark:text-gray-100" 
        },
        { 
          icon: "public", 
          label: "Changer de Pays", 
          href: "/change-country",
          className: "text-primary-500" 
        },
      ]
    }
  ];

  return (
    <DefaultLayout>
      <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto pb-32">
        
        {/* Invite Friends Section */}
        {user?.inviteCode && (
          <div className="bg-gradient-to-r from-primary-500 to-pink-500 rounded-lg p-4 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Invitez vos amis</h3>
                <p className="text-sm opacity-90 mb-2">
                  Code: <span className="font-bold text-xl">{user.inviteCode}</span>
                </p>
                <p className="text-xs opacity-80">
                  {inviteStats.totalInvites > 0 ? (
                    <>Vous avez invité {inviteStats.totalInvites} amis et gagné {inviteStats.rewardsEarned.toLocaleString()} {inviteStats.currency}</>
                  ) : (
                    'Invitez vos amis et gagnez des récompenses !'
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleQuickShare}
                  className="bg-white text-primary-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center text-sm"
                >
                  <span className="material-icons mr-1 text-sm">share</span>
                  Partager
                </button>
                <Link
                  href="/profile/invite-code"
                  className="bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center text-sm text-center"
                >
                  <span className="material-icons mr-1 text-sm">visibility</span>
                  Voir plus
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Settings groups */}
        {settingGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{group.title}</h2>            <div className="space-y-3">
              {group.items.map((item, itemIndex) => {
                return item.onClick ? (
                  <button 
                    key={itemIndex}
                    onClick={item.onClick}
                    className="w-full text-left flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <span className={`material-icons mr-4 ${item.className || (item.icon === 'public' ? 'text-primary-500' : '')}`}>
                        {item.icon}
                      </span>
                      <span className={item.className || "text-gray-900 dark:text-white"}>{item.label}</span>
                    </div>
                    <span className="material-icons text-gray-400 dark:text-gray-500">chevron_right</span>
                  </button>
                ) : (
                  <Link 
                    key={itemIndex} 
                    href={item.href} 
                    className="flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm p-4 rounded-lg border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-center">
                      <span className={`material-icons mr-4 ${item.className || (item.icon === 'public' ? 'text-primary-500' : '')}`}>
                        {item.icon}
                      </span>
                      <span className={item.className || "text-gray-900 dark:text-white"}>{item.label}</span>
                    </div>
                    <span className="material-icons text-gray-400 dark:text-gray-500">chevron_right</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Purchase options */}
        <div className="mt-10 space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Achetez du crédit</h3>
          <div className="flex space-x-2">
            <Link 
              href="/purchase/credits" 
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <span className="material-icons mr-2">payment</span>
              <span>Achat</span>
            </Link>
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Devenez membre Premium/VIP</h3>
          <div className="flex space-x-2">
            <Link 
              href="/premium" 
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <span className="material-icons mr-2">workspace_premium</span>
              <span>Premium</span>
            </Link>
            
            <Link 
              href="/vip" 
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              <span className="material-icons mr-2">diamond</span>
              <span>VIP</span>
            </Link>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
