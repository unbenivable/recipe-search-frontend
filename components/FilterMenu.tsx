import React, { useRef } from 'react';
import { FilterMenuProps } from '@/types';

const FilterMenu: React.FC<FilterMenuProps> = ({ 
  dietaryFilters, 
  toggleDietaryFilter, 
  handleClear, 
  showFilters, 
  setShowFilters 
}) => {
  const filtersRef = useRef<HTMLDivElement>(null);
  
  return (
    <div style={{ position: "relative" }} ref={filtersRef} data-filter-container>
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{ 
          padding: "0.85rem 1.5rem",
          backgroundColor: "#2e2e2e",
          color: Object.values(dietaryFilters).some(v => v) ? "#8ab4f8" : "#ffffff",
          border: "none",
          borderRadius: "16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          fontSize: "16px",
          fontWeight: "500"
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
          <path d="M12 9L20 16H4L12 9Z" fill={Object.values(dietaryFilters).some(v => v) ? "#8ab4f8" : "#ffffff"} />
        </svg>
        <span>Filters</span>
        {Object.values(dietaryFilters).some(v => v) && (
          <div style={{
            width: "6px",
            height: "6px",
            backgroundColor: "#8ab4f8",
            borderRadius: "50%",
            marginLeft: "-2px"
          }} />
        )}
      </button>
      
      {showFilters && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: "220px",
          backgroundColor: "#2e2e2e",
          borderRadius: "12px",
          padding: "1rem",
          zIndex: 10,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }}>
          <h3 style={{ 
            fontSize: "16px", 
            fontWeight: "600", 
            color: "#ffffff",
            marginBottom: "0.75rem" 
          }}>
            Dietary Preferences
          </h3>
          
          {Object.entries(dietaryFilters).map(([filter, isActive]) => (
            <div key={filter} style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid #3e3e3e"
            }}>
              <span style={{ 
                fontSize: "14px", 
                color: "#d0d0d0" 
              }}>
                {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              
              <div 
                onClick={() => toggleDietaryFilter(filter)}
                style={{
                  width: "40px",
                  height: "24px",
                  backgroundColor: isActive ? "#8ab4f8" : "#505050",
                  borderRadius: "12px",
                  padding: "2px",
                  position: "relative",
                  transition: "background-color 0.2s ease",
                  cursor: "pointer"
                }}
              >
                <div style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "white",
                  borderRadius: "50%",
                  position: "absolute",
                  top: "2px",
                  left: isActive ? "18px" : "2px",
                  transition: "left 0.2s ease"
                }} />
              </div>
            </div>
          ))}
          
          {Object.values(dietaryFilters).some(v => v) && (
            <button
              onClick={handleClear}
              style={{
                width: "100%",
                padding: "0.6rem",
                marginTop: "0.75rem",
                backgroundColor: "transparent",
                color: "#8ab4f8",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer"
              }}
            >
              Reset All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterMenu; 