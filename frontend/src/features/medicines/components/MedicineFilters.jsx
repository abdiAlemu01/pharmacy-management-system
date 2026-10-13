import React from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Search } from 'lucide-react';

export const MedicineFilters = ({ search, onSearchChange }) => {
  return (
    <div className="max-w-sm w-full">
      <div className="relative">
        <Input
          placeholder="Search by medicine name...."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
      </div>
    </div>
  );
};
