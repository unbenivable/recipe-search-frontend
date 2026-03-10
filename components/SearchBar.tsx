import React from 'react';
import FilterMenu from './FilterMenu';
import { SearchBarProps } from '@/types';

const SearchBar: React.FC<SearchBarProps> = ({
  ingredients,
  setIngredients,
  dietaryFilters,
  toggleDietaryFilter,
  showFilters,
  setShowFilters,
  handleClear,
  handleSearch,
  isLoading,
  isRateLimited
}) => {
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <div className="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          type="text"
          className="search-input"
          value={ingredients}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIngredients(e.target.value)}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' && !isLoading && !isRateLimited) {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="chicken, rice, garlic..."
        />
        <button
          className="search-submit-btn"
          onClick={handleSearch}
          disabled={isLoading || isRateLimited}
          aria-label="Search recipes"
        >
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          )}
        </button>
      </div>

      <FilterMenu
        dietaryFilters={dietaryFilters}
        toggleDietaryFilter={toggleDietaryFilter}
        handleClear={handleClear}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
    </div>
  );
};

export default SearchBar;
