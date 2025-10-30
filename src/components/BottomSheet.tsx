'use client'

import React, { useEffect, useRef } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: string;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = 'auto'
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      
      {/* Bottom sheet content */}
      <div
        ref={sheetRef}
        style={{ maxHeight: `calc(100vh - 1rem)`, height: height || 'auto' }}
        className="w-full max-w-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-t-2xl overflow-auto transform transition-transform duration-300 ease-out relative z-10 border-t border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        {children}
      </div>
    </div>
  );
};

export default BottomSheet;
