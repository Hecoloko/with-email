import React from 'react';
import { SearchIcon } from '../icons/SearchIcon';
import { FilterIcon } from '../icons/FilterIcon';

interface ApplicantsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
}

export const ApplicantsHeader: React.FC<ApplicantsHeaderProps> = ({ searchQuery, onSearchChange, onFilterClick }) => {
  return (
    <div className="px-4 pt-0 pb-4 flex gap-2 items-center">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name or role..."
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-purple focus:border-accent-purple"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="flex-shrink-0 bg-zinc-800 hover:bg-zinc-700 text-gray-200 font-semibold p-2.5 rounded-lg transition-colors"
        aria-label="Filter applicants"
      >
        <FilterIcon className="h-5 w-5" />
      </button>
    </div>
  );
};