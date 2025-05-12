const RecipeList = ({ recipes, isLoading, totalResults, isMobile, onRecipeClick }) => {
  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <div className="loading-spinner" style={{ width: "24px", height: "24px", margin: "0 auto 1rem auto" }}></div>
        <p style={{ color: "#a0a0a0" }}>Loading recipes...</p>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#a0a0a0" }}>No recipes found. Try different ingredients or fewer filters.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginBottom: "1rem" }}>
      <div style={{ fontSize: "16px", fontWeight: "500", color: "#ffffff", marginBottom: "1rem" }}>
        {totalResults} {totalResults === 1 ? 'Recipe' : 'Recipes'} Found
      </div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1.5rem"
      }}>
        {recipes.map((recipe, index) => (
          <div 
            key={index} 
            style={{ 
              backgroundColor: "#2e2e2e", 
              borderRadius: "16px", 
              padding: "1.5rem", 
              textAlign: "left",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer"
            }}
            className="recipe-card"
            onClick={() => onRecipeClick(recipe)}
          >
            <h3 style={{ 
              fontSize: "18px", 
              fontWeight: "600", 
              marginBottom: "0.75rem",
              color: "#ffffff"
            }}>
              {recipe.title}
            </h3>
            
            {recipe.matchScore && (
              <div style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "0.75rem"
              }}>
                <div style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#3e3e3e",
                  borderRadius: "3px",
                  overflow: "hidden",
                  marginRight: "8px"
                }}>
                  <div style={{
                    height: "100%",
                    width: `${recipe.matchPercentage}%`,
                    backgroundColor: recipe.matchPercentage > 80 ? "#8ab4f8" : "#f28b82",
                    borderRadius: "3px"
                  }}/>
                </div>
                <span style={{ color: "#a0a0a0", fontSize: "12px", whiteSpace: "nowrap" }}>
                  {recipe.matchScore} of {recipe.ingredients.length} ingredients
                </span>
              </div>
            )}
            
            <h4 style={{ 
              fontSize: "14px", 
              fontWeight: "600", 
              color: "#a0a0a0",
              marginBottom: "0.5rem" 
            }}>
              Ingredients:
            </h4>
            
            <ul style={{ 
              paddingLeft: "1.25rem", 
              marginBottom: "1rem", 
              color: "#d0d0d0" 
            }}>
              {recipe.ingredients.slice(0, 5).map((ing, i) => (
                <li key={i} style={{ marginBottom: "0.25rem", fontSize: "14px" }}>{ing}</li>
              ))}
              {recipe.ingredients.length > 5 && (
                <li style={{ marginBottom: "0.25rem", fontSize: "14px", color: "#a0a0a0" }}>
                  +{recipe.ingredients.length - 5} more
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList; 