import { useRef } from 'react';

const SearchForm = ({ 
  ingredients,
  setIngredients,
  dietaryFilters,
  toggleDietaryFilter,
  showDietaryDropdown,
  setShowDietaryDropdown,
  dietaryDropdownRef,
  handleClear,
  handleSearch,
  isLoading,
  isRateLimited = false,
  isMobile = false
}) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap gap-3 items-start justify-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading && !isRateLimited) {
                e.preventDefault();
                handleSearch();
              }
            }}
            placeholder="e.g. chicken, rice, garlic"
            className={`w-full px-4 py-3 rounded-lg border ${isRateLimited ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'} focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm`}
            disabled={isRateLimited}
          />
          <button 
            onClick={handleSearch} 
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full ${
              isLoading || isRateLimited 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors shadow-md`}
            disabled={isLoading || isRateLimited}
            aria-label="Search recipes"
            title={isRateLimited ? "Too many requests, please wait" : "Search recipes"}
          >
            {isLoading ? (
              <div className="loading-spinner w-4 h-4"></div>
            ) : isRateLimited ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            )}
          </button>
        </div>
        
        <div className="relative" ref={dietaryDropdownRef}>
          <button
            onClick={() => setShowDietaryDropdown(!showDietaryDropdown)}
            className={`px-4 py-3 rounded-lg shadow-sm border flex items-center gap-2 ${
              Object.values(dietaryFilters).some(v => v)
                ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800'
                : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
            } hover:shadow-md transition-all`}
          >
            <svg className={`w-5 h-5 transition-transform ${showDietaryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
            <span>Dietary Filters</span>
            {Object.values(dietaryFilters).some(v => v) && (
              <span className="inline-flex items-center justify-center w-5 h-5 ml-1 text-xs font-bold text-white bg-green-500 rounded-full">
                {Object.values(dietaryFilters).filter(Boolean).length}
              </span>
            )}
          </button>
          
          {showDietaryDropdown && (
            <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dietary Preferences
                </h3>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(dietaryFilters).map(([filter, isActive]) => (
                  <div 
                    key={filter} 
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-800"
                    onClick={() => toggleDietaryFilter(filter)}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    
                    <div className={`relative w-10 h-5 transition-colors duration-200 ease-in-out rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
                      <div 
                        className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out transform ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleClear}
                  className="w-full py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchForm; 