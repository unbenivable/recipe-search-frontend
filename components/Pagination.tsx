import React from 'react';
import { PaginationProps } from '@/types';

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageNumbers,
  setPage
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination fade-in">
      <button
        className="page-btn page-btn-nav"
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft />
        Prev
      </button>

      {pageNumbers.map((page, i) => (
        <button
          key={i}
          className={`page-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => typeof page === 'number' ? setPage(page) : null}
          disabled={typeof page !== 'number'}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
        >
          {page}
        </button>
      ))}

      <button
        className="page-btn page-btn-nav"
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        Next
        <ChevronRight />
      </button>
    </div>
  );
};

export default Pagination;
