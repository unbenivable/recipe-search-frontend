import React from 'react';
import { SearchModeSelectorProps } from '@/types';

const SearchModeSelector: React.FC<SearchModeSelectorProps> = ({ searchMode, setSearchMode }) => {
  return (
    <div className="mode-selector">
      <button
        className={`mode-selector-btn ${searchMode === 'recipe' ? 'active' : ''}`}
        onClick={() => setSearchMode('recipe')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        By Ingredients
      </button>
      <button
        className={`mode-selector-btn ${searchMode === 'detect' ? 'active' : ''}`}
        onClick={() => setSearchMode('detect')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        Scan Image
      </button>
    </div>
  );
};

export default SearchModeSelector;
