import React from 'react';
import { Recipe } from '@/types';
import RecipeListSkeleton from './RecipeListSkeleton';

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  totalResults: number;
  onRecipeClick: (recipe: Recipe) => void;
  savedTitles?: Set<string>;
  onToggleSave?: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  isLoading,
  totalResults,
  onRecipeClick,
  savedTitles,
  onToggleSave
}) => {
  if (isLoading) {
    return <RecipeListSkeleton count={9} />;
  }

  if (recipes.length === 0) {
    return (
      <div className="no-results fade-in">
        <p>No recipes found. Try different ingredients or fewer filters.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="results-header">
        <p className="results-count">
          <strong>{totalResults}</strong> {totalResults === 1 ? 'recipe' : 'recipes'} found
        </p>
      </div>

      <div className="recipe-grid">
        {recipes.map((recipe, index) => {
          const saved = savedTitles?.has(recipe.title) ?? false;

          return (
            <div
              key={recipe.id || index}
              className="recipe-card"
              style={{ animationDelay: `${index * 0.04}s` }}
              onClick={() => onRecipeClick(recipe)}
            >
              {onToggleSave && (
                <button
                  className={`recipe-heart ${saved ? 'saved' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSave(recipe);
                  }}
                  aria-label={saved ? 'Unsave recipe' : 'Save recipe'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24"
                    fill={saved ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              )}

              <h3 className="recipe-card-title">{recipe.title}</h3>

              {recipe.matchScore !== undefined && (
                <div className={`recipe-card-match ${recipe.matchPercentage && recipe.matchPercentage > 80 ? 'high' : 'low'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  {recipe.matchScore} of {recipe.ingredients.length} matched
                </div>
              )}

              <div className="recipe-card-section-label">Ingredients</div>

              <div className="ingredient-pills">
                {recipe.ingredients.slice(0, 5).map((ing, i) => (
                  <span key={i} className="ingredient-pill">{ing}</span>
                ))}
                {recipe.ingredients.length > 5 && (
                  <span className="ingredient-pill more">+{recipe.ingredients.length - 5} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecipeList;
