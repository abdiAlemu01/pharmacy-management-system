import React from 'react';
import { Button } from './Button';
import { Select } from './Select';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  const limitOptions = [
    { value: 10, label: '10 per page' },
    { value: 20, label: '20 per page' },
    { value: 50, label: '50 per page' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-1 text-sm text-slate-600">
      <div className="flex items-center gap-3">
        <span>
          Showing page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong> (<strong>{totalRecords}</strong> total records)
        </span>
        <div className="w-36">
          <Select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            options={limitOptions}
            className="py-1 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="text-xs px-3 py-1.5"
        >
          Previous
        </Button>
        <span className="text-xs font-semibold px-2">
          {currentPage} / {totalPages || 1}
        </span>
        <Button
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="text-xs px-3 py-1.5"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

