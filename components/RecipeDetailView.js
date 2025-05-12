import { useEffect } from 'react';

const RecipeDetailView = ({ recipe, onClose }) => {
  if (!recipe) return null;
  
  const handleBackdropClick = (e) => {
    // Only close if the click was directly on the backdrop, not on the content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Add keyboard event listener for Escape key
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    
    // Disable body scroll while modal is open
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      
      // Re-enable body scroll when modal is closed
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div 
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px"
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        backgroundColor: "#1e1e1e",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "800px",
        maxHeight: "90vh",
        overflow: "auto",
        position: "relative",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        padding: "30px"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            backgroundColor: "#2e2e2e",
            color: "#ffffff",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold"
          }}
        >
          ✕
        </button>

        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: "700", 
          marginBottom: "1.5rem",
          color: "#ffffff" 
        }}>
          {recipe.title}
        </h2>

        {recipe.matchScore && (
          <div style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "1.5rem"
          }}>
            <div style={{
              width: "200px",
              height: "8px",
              backgroundColor: "#3e3e3e",
              borderRadius: "4px",
              overflow: "hidden",
              marginRight: "12px"
            }}>
              <div style={{
                height: "100%",
                width: `${recipe.matchPercentage}%`,
                backgroundColor: recipe.matchPercentage > 80 ? "#8ab4f8" : "#f28b82",
                borderRadius: "4px"
              }}/>
            </div>
            <span style={{ color: "#a0a0a0", fontSize: "14px" }}>
              {recipe.matchScore} of {recipe.ingredients.length} ingredients matched
            </span>
          </div>
        )}

        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            marginBottom: "1rem",
            color: "#ffffff"
          }}>
            Ingredients
          </h3>
          <ul style={{ 
            paddingLeft: "1.5rem", 
            color: "#d0d0d0",
            fontSize: "16px",
            lineHeight: 1.6
          }}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>{ing}</li>
            ))}
          </ul>
        </div>

        {recipe.directions && (
          <div>
            <h3 style={{ 
              fontSize: "20px", 
              fontWeight: "600", 
              marginBottom: "1rem",
              color: "#ffffff"
            }}>
              Directions
            </h3>
            <ol style={{ 
              paddingLeft: "1.5rem", 
              color: "#d0d0d0",
              fontSize: "16px",
              lineHeight: 1.6
            }}>
              {recipe.directions.map((step, i) => (
                <li key={i} style={{ marginBottom: "1rem" }}>{step}</li>
              ))}
            </ol>
          </div>
        )}
        
        {/* Nutritional Information */}
        {recipe.nutrition && (
          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ 
              fontSize: "20px", 
              fontWeight: "600", 
              marginBottom: "1rem",
              color: "#ffffff"
            }}>
              Nutrition Facts
            </h3>
            
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "1rem",
              backgroundColor: "#2e2e2e",
              borderRadius: "12px",
              padding: "1.5rem"
            }}>
              {Object.entries(recipe.nutrition).map(([key, value]) => (
                <div key={key} style={{
                  textAlign: "center",
                  padding: "0.5rem"
                }}>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#8ab4f8" }}>
                    {value}
                  </div>
                  <div style={{ fontSize: "14px", color: "#a0a0a0", textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {!recipe.directions && (
          <div style={{ 
            padding: "1.5rem", 
            backgroundColor: "#2e2e2e",
            borderRadius: "12px",
            textAlign: "center",
            marginTop: "1rem"
          }}>
            <p style={{ color: "#a0a0a0", marginBottom: "0.5rem" }}>
              Full directions not available for this recipe.
            </p>
            <p style={{ color: "#8ab4f8", fontSize: "14px" }}>
              Try searching for "{recipe.title}" online for complete instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetailView; 