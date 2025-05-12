import React from 'react';
import { PaginationProps } from '@/types';

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  pageNumbers,
  setPage 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="pagination-container fade-in" style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      marginTop: "2rem",
      gap: "0.25rem",
      userSelect: "none"
    }}>
      <button
        onClick={() => setPage(1)}
        disabled={currentPage === 1}
        aria-label="First page"
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: currentPage === 1 ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.7 : 1,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          fontSize: "14px"
        }}
      >
        ⟪
      </button>
      
      <button
        onClick={() => setPage(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: currentPage === 1 ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          opacity: currentPage === 1 ? 0.7 : 1,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          marginRight: "0.5rem",
          fontSize: "14px"
        }}
      >
        ❮
      </button>
      
      {pageNumbers.map((page, i) => (
        <button
          key={i}
          onClick={() => typeof page === 'number' ? setPage(page) : null}
          disabled={typeof page !== 'number'}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
          style={{
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: currentPage === page ? "#4285f4" : "#2e2e2e",
            color: currentPage === page ? "white" : "#d0d0d0",
            border: "none",
            borderRadius: "8px",
            cursor: typeof page === 'number' ? "pointer" : "default",
            fontWeight: currentPage === page ? 600 : 400,
            transition: "all 0.2s ease-in-out",
            fontSize: "14px",
            margin: "0 2px"
          }}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => setPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: currentPage === totalPages ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.7 : 1,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          marginLeft: "0.5rem",
          fontSize: "14px"
        }}
      >
        ❯
      </button>
      
      <button
        onClick={() => setPage(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
        style={{
          padding: "0.5rem 0.75rem",
          backgroundColor: currentPage === totalPages ? "#3e3e3e" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          opacity: currentPage === totalPages ? 0.7 : 1,
          fontWeight: 500,
          transition: "all 0.2s ease-in-out",
          fontSize: "14px"
        }}
      >
        ⟫
      </button>
    </div>
  );
};

export default Pagination; 