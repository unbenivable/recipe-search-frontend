import React, { useEffect } from 'react';
import { RecipeDetailViewProps } from '@/types';

const RecipeDetailView: React.FC<RecipeDetailViewProps> = ({
  recipe,
  onClose,
  isSaved,
  onToggleSave
}) => {
  if (!recipe) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="modal-title-row">
            <h2 className="modal-title">{recipe.title}</h2>
            {onToggleSave && (
              <button
                className={`recipe-heart modal-heart ${isSaved ? 'saved' : ''}`}
                onClick={() => onToggleSave(recipe)}
                aria-label={isSaved ? 'Unsave recipe' : 'Save recipe'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24"
                  fill={isSaved ? 'currentColor' : 'none'}
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            )}
          </div>

          {recipe.matchScore !== undefined && (
            <div
              className={`modal-match-badge ${recipe.matchPercentage && recipe.matchPercentage > 80 ? 'recipe-card-match high' : 'recipe-card-match low'}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
              {recipe.matchScore} of {recipe.ingredients.length} ingredients matched
            </div>
          )}
        </div>

        <div className="modal-body">
          {/* Ingredients */}
          <div className="modal-section">
            <h3 className="modal-section-title">Ingredients</h3>
            <div className="modal-ingredients-grid">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="modal-ingredient-item">{ing}</div>
              ))}
            </div>
          </div>

          {/* Directions */}
          {recipe.directions && (
            <div className="modal-section">
              <h3 className="modal-section-title">Directions</h3>
              {recipe.directions.map((step, i) => (
                <div key={i} className="modal-direction-step">
                  <div className="modal-step-number">{i + 1}</div>
                  <div className="modal-step-text">{step}</div>
                </div>
              ))}
            </div>
          )}

          {/* Nutrition */}
          {recipe.nutrition && (
            <div className="modal-section">
              <h3 className="modal-section-title">Nutrition Facts</h3>
              <div className="nutrition-grid">
                {Object.entries(recipe.nutrition).map(([key, value]) => (
                  <div key={key} className="nutrition-item">
                    <div className="nutrition-value">{value}</div>
                    <div className="nutrition-label">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Directions Fallback */}
          {!recipe.directions && (
            <div className="modal-no-directions">
              <p>Full directions not available for this recipe.</p>
              <p className="search-hint-link">
                Try searching for &ldquo;{recipe.title}&rdquo; online for complete instructions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailView;
