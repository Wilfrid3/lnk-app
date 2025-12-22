// src/app/layout.tsx
import './globals.css'
import { Nunito } from 'next/font/google'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ThemeProvider'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { TrackingProvider } from '@/contexts/TrackingContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { AgeVerificationProvider } from '@/contexts/AgeVerificationContext'
import AgeVerificationModal from '@/components/AgeVerificationModal'
import OnlineStatusManager from '@/components/OnlineStatusManager'
import ServiceWorkerMessageHandler from '@/components/ServiceWorkerMessageHandler'
import NotificationPrompt from '@/components/NotificationPrompt'
import SignInPrompt from '@/components/SignInPrompt'
import UpdateNotification from '@/components/UpdateNotification'

// Initialize theme script to prevent FOUC
const themeInitScript = `
  (function() {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  })();
`;

// Script to make it harder to bypass age verification
// This is a lightweight approach that doesn't impact performance significantly
const ageVerificationScript = `
  (function() {
    let lastCheck = 0;
    
    // Check if modal was hidden via CSS
    function checkModalVisibility() {
      // Only run checks occasionally to avoid performance impact
      const now = Date.now();
      if (now - lastCheck < 2000) return; // Don't check more often than every 2 seconds
      lastCheck = now;
      
      const modal = document.getElementById('age-verification-modal');
      if (modal && localStorage.getItem('age-verified') !== 'true') {
        const style = window.getComputedStyle(modal);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
          modal.style.display = 'flex';
          modal.style.visibility = 'visible';
          modal.style.opacity = '1';
        }
      }
    }
    
    // Add listeners with throttling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkModalVisibility, 500);
    });
    
    // Run checks less frequently for better performance
    setInterval(checkModalVisibility, 5000);
  })();
`;

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'),
  title: {
    default: 'yamohub - Plateforme de Services d\'Accompagnement Premium au Cameroun',
    template: '%s | yamohub'
  },
  description: 'Découvrez yamohub, la plateforme leader de services d\'accompagnement premium au Cameroun. Profils vérifiés, services de qualité à Yaoundé, Douala et dans tout le pays.',
  keywords: [
    'escort Cameroun', 'accompagnement Yaoundé', 'services premium Douala',
    'escort vérifiée', 'accompagnatrice professionnelle', 'services discrets',
    'escort Bafoussam', 'accompagnement Kribi', 'plateforme premium'
  ],
  authors: [{ name: 'yamohub' }],
  creator: 'yamohub',
  publisher: 'yamohub',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
    siteName: 'yamohub',
    title: 'yamohub - Plateforme de Services d\'Accompagnement Premium au Cameroun',
    description: 'Découvrez yamohub, la plateforme leader de services d\'accompagnement premium au Cameroun. Profils vérifiés, services de qualité.',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'}/images/logof.png`,
        width: 1200,
        height: 630,
        alt: 'yamohub - Plateforme Premium',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'yamohub - Services Premium au Cameroun',
    description: 'Plateforme leader de services d\'accompagnement premium. Profils vérifiés, qualité garantie.',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'}/images/logof.png`],
  },
  verification: {
    // Add verification codes if you have them
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  other: {
    'content-language': 'fr-FR',
    'age-rating': 'adult',
    'rating': 'RTA-5042-1996-1400-1577-RTA',
    'content-rating': '18+',
    'audience': 'adult',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'yamohub',
    description: 'Plateforme de services d\'accompagnement premium au Cameroun',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'}/images/logof.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['French', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'CM',
      addressLocality: 'Yaoundé',
    },
  }

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'yamohub',
    description: 'Plateforme de services d\'accompagnement premium au Cameroun',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yamohub.com'}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="fr" className={`${nunito.variable} scroll-smooth`}>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Additional SEO Meta Tags */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#d97706" />
        <meta name="msapplication-TileColor" content="#d97706" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="yamohub" />
        
        {/* Age Verification and Content Rating */}
        <meta name="rating" content="RTA-5042-1996-1400-1577-RTA" />
        <meta name="PICS-Label" content='(PICS-1.1 "http://www.rsac.org/ratingsv01.html" l gen true for "http://www.rsac.org/" r (s 4))' />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons and Apple Touch Icons */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="mask-icon" href="/favicon.png" color="#d97706" />
        
        {/* Inline script to set the theme before the page renders */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* Performance-friendly age verification protection script */}
        <script dangerouslySetInnerHTML={{ __html: ageVerificationScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <TrackingProvider>
              <AgeVerificationProvider>
                <OnlineStatusManager />
                <ServiceWorkerMessageHandler />
                <NotificationPrompt />
                <SignInPrompt />
                <UpdateNotification />
                <AgeVerificationModal />
                {children}
              </AgeVerificationProvider>
            </TrackingProvider>
          </AuthProvider>
        </ThemeProvider>
        <GoogleAnalytics />
      </body>
    </html>
  )
}