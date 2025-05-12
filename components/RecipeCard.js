import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { shareRecipe, openRecipeInNewTab } from '../utils/recipeStorage';

const RecipeCard = ({ recipe }) => {
  const [expanded, setExpanded] = useState(false);

  const handleShareClick = (e) => {
    e.stopPropagation(); // Prevent expanding the recipe
    shareRecipe(recipe);
  };

  const handleOpenInNewTab = (e) => {
    e.stopPropagation(); // Prevent expanding the recipe
    openRecipeInNewTab(recipe);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 w-full transition-all duration-200 hover:shadow-lg recipe-card"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="absolute top-3 right-3 flex space-x-2">
        <button
          onClick={handleShareClick}
          className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Share recipe"
          title="Share recipe"
        >
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
          </svg>
        </button>
        
        <button
          onClick={handleOpenInNewTab}
          className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Open in new tab"
          title="Open in new tab with larger text"
        >
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
          </svg>
        </button>
      </div>

      <Link href={`/recipe/${recipe.id}`} className="block">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white pr-16">
          {recipe.title}
        </h3>
      </Link>
      
      {/* Recipe metadata tags */}
      {(recipe.cookingTime || recipe.cuisine || recipe.mealType) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {recipe.cookingTime && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-xs font-medium">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
              {recipe.cookingTime} min
            </span>
          )}
          
          {recipe.cuisine && (
            <span className="inline-flex px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-xs font-medium">
              {recipe.cuisine}
            </span>
          )}
          
          {recipe.mealType && (
            <span className="inline-flex px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-full text-xs font-medium">
              {recipe.mealType}
            </span>
          )}
        </div>
      )}
      
      {recipe.matchScore && (
        <div className="flex items-center mb-3">
          <div className="flex-grow h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mr-2">
            <div className={`h-full rounded-full ${
              recipe.matchPercentage > 80 ? 'bg-green-500' : 
              recipe.matchPercentage > 50 ? 'bg-yellow-500' : 'bg-orange-500'
            }`} style={{ width: `${recipe.matchPercentage}%` }}></div>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {recipe.matchScore} of {recipe.searchIngredients?.length || recipe.matchDetails?.length || recipe.matchScore || 2}
          </span>
        </div>
      )}
      
      <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
        Ingredients:
      </h4>
      
      <ul className="pl-5 mb-4 text-gray-700 dark:text-gray-300 list-disc">
        {recipe.ingredients.slice(0, 5).map((ingredient, i) => (
          <li key={i} className="mb-1 text-sm">{ingredient}</li>
        ))}
        {recipe.ingredients.length > 5 && (
          <li className="mb-1 text-sm text-gray-500 dark:text-gray-400">+{recipe.ingredients.length - 5} more</li>
        )}
      </ul>

      {recipe.directions && (
        <div>
          {expanded ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-300 mb-2">
                Directions:
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                {recipe.directions.join(' ')}
              </p>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(false);
                }}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Show Less
              </button>
            </div>
          ) : (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
              }}
              className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              View Directions
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipeCard; 