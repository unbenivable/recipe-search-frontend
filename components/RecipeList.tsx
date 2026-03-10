import React from 'react';
import { Recipe } from '@/types';
import RecipeListSkeleton from './RecipeListSkeleton';

interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  totalResults: number;
  onRecipeClick: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, isLoading, totalResults, onRecipeClick }) => {
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
        {recipes.map((recipe, index) => (
          <div
            key={recipe.id || index}
            className="recipe-card"
            style={{ animationDelay: `${index * 0.04}s` }}
            onClick={() => onRecipeClick(recipe)}
          >
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
        ))}
      </div>
    </div>
  );
};

export default RecipeList;
