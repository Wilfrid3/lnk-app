// src/utils/analytics.ts

/**
 * Google Analytics utility functions
 */

// Define a proper type for additional parameters
type EventParams = Record<string, string | number | boolean | null | undefined>;

// Basic event tracking
export const trackEvent = (
  action: string, 
  category: string, 
  label?: string, 
  value?: number,
  additionalParams?: EventParams
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...additionalParams,
    });
  }
};

// Track page views
export const trackPageView = (url: string) => {
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID as string;
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// User authentication events
export const trackAuth = {
  login: (method: 'phone' | 'email' | 'social') => 
    trackEvent('login', 'authentication', method),
  
  logout: () => 
    trackEvent('logout', 'authentication'),
  
  register: (method: 'phone' | 'email' | 'social') => 
    trackEvent('register', 'authentication', method),
  
  verifyPhone: () => 
    trackEvent('verify_phone', 'authentication'),
  
  forgotPassword: () => 
    trackEvent('forgot_password', 'authentication'),
  
  resetPassword: () => 
    trackEvent('reset_password', 'authentication'),
    
  attempt: (method: 'phone' | 'email' | 'social') =>
    trackEvent('login_attempt', 'authentication', method),
    
  error: (action: string, error: Error) =>
    trackEvent('auth_error', 'authentication', action, undefined, { error_message: error.message }),
};

// Profile events
export const trackProfile = {
  update: (fields: string[]) => 
    trackEvent('update_profile', 'profile', fields.join(',')),
  
  uploadAvatar: () => 
    trackEvent('upload_avatar', 'profile'),
  
  changeSettings: (setting: string) => 
    trackEvent('change_settings', 'profile', setting)
};

// Messaging events
export const trackMessaging = {
  sendMessage: () => 
    trackEvent('send_message', 'messaging'),
  
  receiveMessage: () => 
    trackEvent('receive_message', 'messaging'),
  
  createConversation: () => 
    trackEvent('create_conversation', 'messaging'),
  
  deleteConversation: () => 
    trackEvent('delete_conversation', 'messaging')
};

// Service events
export const trackService = {
  search: (query: string) => 
    trackEvent('search', 'service', query),
  
  view: (serviceId: string) => 
    trackEvent('view_service', 'service', serviceId),
  
  create: (category: string) => 
    trackEvent('create_service', 'service', category),
  
  update: (serviceId: string) => 
    trackEvent('update_service', 'service', serviceId),
  
  delete: (serviceId: string) => 
    trackEvent('delete_service', 'service', serviceId),
  
  favorite: (serviceId: string) => 
    trackEvent('favorite_service', 'service', serviceId),
  
  unfavorite: (serviceId: string) => 
    trackEvent('unfavorite_service', 'service', serviceId),
  
  contact: (serviceId: string) => 
    trackEvent('contact_service_owner', 'service', serviceId)
};

// App usage events
export const trackApp = {
  themeChange: (theme: 'light' | 'dark') => 
    trackEvent('change_theme', 'app_usage', theme),
  
  languageChange: (language: string) => 
    trackEvent('change_language', 'app_usage', language),
  
  error: (errorCode: string, errorMessage: string) => 
    trackEvent('error', 'app_usage', errorCode, undefined, { error_message: errorMessage }),
  
  featureUse: (feature: string) => 
    trackEvent('use_feature', 'app_usage', feature)
};
