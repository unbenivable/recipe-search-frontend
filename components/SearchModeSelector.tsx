import React from 'react';
import { SearchModeSelectorProps } from '@/types';

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({ searchMode, setSearchMode, isMobile }) => {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "center", 
      marginBottom: "2rem",
      background: "#1e1e1e",
      padding: "4px",
      borderRadius: "16px",
      maxWidth: "600px",
      margin: "0 auto 2rem auto",
      gap: "4px"
    }}>
      <button 
        onClick={() => setSearchMode('recipe')}
        style={{ 
          padding: "0.75rem 1rem", 
          backgroundColor: searchMode === 'recipe' ? "#2e2e2e" : "transparent",
          color: searchMode === 'recipe' ? "#ffffff" : "#a0a0a0",
          border: "none",
          borderRadius: "12px",
          fontWeight: searchMode === 'recipe' ? "600" : "400",
          fontSize: "16px",
          flex: 1,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        Search by Ingredients
      </button>
      <button 
        onClick={() => setSearchMode('detect')}
        style={{ 
          padding: "0.75rem 1rem", 
          backgroundColor: searchMode === 'detect' ? "#2e2e2e" : "transparent",
          color: searchMode === 'detect' ? "#ffffff" : "#a0a0a0",
          border: "none",
          borderRadius: "12px",
          fontWeight: searchMode === 'detect' ? "600" : "400",
          fontSize: "16px",
          flex: 1,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        {isMobile ? "Detect Ingredients" : "Detect Ingredients from Image"}
      </button>
    </div>
  );
};

export default SearchModeSelector; 