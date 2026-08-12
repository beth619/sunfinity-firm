'use client';

import React from 'react';

export interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export default function FilterChip({
  label,
  isSelected,
  onClick,
  className = '',
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`inline-flex min-h-[36px] items-center justify-center rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#14213D] focus:ring-offset-2 ${
        isSelected
          ? 'bg-[#14213D] text-white shadow-sm border border-[#14213D] dark:bg-[#14213D] dark:text-white dark:border-white/20'
          : 'bg-gray-100 text-black hover:bg-gray-200 border border-transparent dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
      } ${className}`}
    >
      {label}
    </button>
  );
}
