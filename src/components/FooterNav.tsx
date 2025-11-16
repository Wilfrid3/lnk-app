// src/components/FooterNav.tsx
'use client'
import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useMessagingStore } from '@/store/useMessagingStore';
import { useAuth } from '@/contexts/AuthContext';

const FooterNav: React.FC = () => {
  const pathname = usePathname();
  const { user: currentUser } = useAuth();
  const { conversations } = useMessagingStore();

  // Calculate total unread messages
  const totalUnread = useMemo(() => {
    if (!conversations || !currentUser) return 0;
    
    const currentUserId = (currentUser as { id?: string; _id?: string })?.id || (currentUser as { id?: string; _id?: string })?._id;
    
    return conversations.reduce((total, conversation) => {
      const unreadCount = conversation.unreadCounts?.[currentUserId || ''] || 0;
      return total + unreadCount;
    }, 0);
  }, [conversations, currentUser]);

  // Function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  // Classes for active and inactive states
  const activeClass = "flex flex-col items-center text-primary-500";
  const inactiveClass = "flex flex-col items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 z-30" style={{ height: 64 }}>
      <div className="max-w-md mx-auto flex justify-around h-full items-center">
        <Link href="/" className={isActive('/') ? activeClass : inactiveClass}>
          <span className="material-icons" style={{ fontSize: 28 }}>home</span>
        </Link>
        <Link href="/search" className={isActive('/search') ? activeClass : inactiveClass}>
          <span className="material-icons" style={{ fontSize: 28 }}>search</span>
        </Link>
        <Link href="/videos" className={isActive('/videos') ? activeClass : inactiveClass}>
          {/* <span className="material-icons" style={{ fontSize: 28 }}>whatshot</span> */}
          <Image className='bg-white dark:bg-gray-800' src="/images/fire.gif" alt="" width={32} height={32} />
        </Link>
        <Link href="/messages" className={`${isActive('/messages') ? activeClass : inactiveClass} relative`}>
          <span className="material-icons" style={{ fontSize: 28 }}>chat_bubble_outline</span>
          {totalUnread > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalUnread > 9 ? '9+' : totalUnread}
            </div>
          )}
        </Link>
        <Link href="/profile" className={isActive('/profile') ? activeClass : inactiveClass}>
          <span className="material-icons" style={{ fontSize: 28 }}>person_outline</span>
        </Link>
      </div>
    </nav>
  );
};

export default FooterNav;
