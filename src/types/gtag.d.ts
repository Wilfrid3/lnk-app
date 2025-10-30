// src/types/gtag.d.ts

interface Window {
  gtag: (
    command: 'config' | 'event' | 'js' | 'set',
    targetId: string,
    config?: {
      page_path?: string;
      page_location?: string;
      page_title?: string;
      send_to?: string;
      event_category?: string;
      event_label?: string;
      value?: number;
      items?: unknown[];
      // For event parameters where we don't know all possible keys but need type safety
      [key: string]: string | number | boolean | unknown[] | undefined;
    }
  ) => void;
}
