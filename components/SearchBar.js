import FilterMenu from './FilterMenu';

const SearchBar = ({ 
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
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      gap: "0.75rem", 
      marginBottom: "2rem",
      flexWrap: "wrap"
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: "500px",
      }}>
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
          style={{ 
            padding: "0.85rem 1rem", 
            paddingRight: "3.5rem",
            width: "100%", 
            borderRadius: "16px",
            backgroundColor: "#2e2e2e",
            color: "#ffffff",
            border: "none",
            fontSize: "16px",
            outline: "none"
          }}
        />
        <button 
          onClick={handleSearch} 
          style={{ 
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "36px",
            height: "36px",
            backgroundColor: "#4285f4",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
          disabled={isLoading || isRateLimited}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
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