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
  const hasActive = Object.values(dietaryFilters).some(v => v);

  return (
    <div className="filter-wrapper" ref={filtersRef} data-filter-container>
      <button
        className={`filter-btn ${hasActive ? 'has-active' : ''}`}
        onClick={() => setShowFilters(!showFilters)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Filters
        {hasActive && <span className="filter-active-dot" />}
      </button>

      {showFilters && (
        <div className="filter-dropdown slide-down">
          <div className="filter-dropdown-title">Dietary Preferences</div>

          {Object.entries(dietaryFilters).map(([filter, isActive]) => (
            <div key={filter} className="filter-item">
              <span className="filter-label">
                {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <div
                className={`toggle ${isActive ? 'active' : ''}`}
                onClick={() => toggleDietaryFilter(filter)}
                role="switch"
                aria-checked={isActive}
              >
                <div className="toggle-knob" />
              </div>
            </div>
          ))}

          {hasActive && (
            <button className="filter-reset-btn" onClick={handleClear}>
              Reset All
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterMenu;
