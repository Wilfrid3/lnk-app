'use client';

import React, { createContext, useContext, useState } from 'react';

interface TabsContextValue {
  selectedTab: string;
  setSelectedTab: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export const Tabs = ({ defaultValue, children, className = '', ...props }: {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [selectedTab, setSelectedTab] = useState<string>(defaultValue);

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={`${className}`} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    role="tablist"
    className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 dark:bg-gray-800 ${className}`}
    {...props}
  />
);

export const TabsTrigger = ({ value, children, className = '', ...props }: {
  value: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component');
  }
  
  const { selectedTab, setSelectedTab } = context;
  const isActive = selectedTab === value;
  
  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setSelectedTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:ring-offset-gray-900 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-white ${
        isActive
          ? 'bg-white text-gray-900 shadow dark:bg-gray-700 dark:text-white'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '', ...props }: {
  value: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component');
  }
  
  const { selectedTab } = context;
  const isActive = selectedTab === value;
  
  if (!isActive) return null;
  
  return (
    <div
      role="tabpanel"
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:ring-offset-gray-900 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
