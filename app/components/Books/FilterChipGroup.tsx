'use client';

import React from 'react';
import FilterChip from './FilterChip';

export interface FilterChipGroupProps {
  groupLabel?: string;
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function FilterChipGroup({
  groupLabel,
  options,
  selected,
  onChange,
  className = '',
}: FilterChipGroupProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      {groupLabel && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#14213D] dark:text-gray-300">
          {groupLabel}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option}
            label={option}
            isSelected={selected === option}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}
