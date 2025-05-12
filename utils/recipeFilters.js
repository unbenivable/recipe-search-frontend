// Lists for non-vegan/vegetarian ingredients to filter out
export const meatIngredients = [
  'beef', 'pork', 'lamb', 'chicken', 'turkey', 'bacon', 'ham', 'sausage', 
  'veal', 'venison', 'duck', 'goose', 'meat', 'steak', 'ribs', 'brisket',
  'prosciutto', 'salami', 'pepperoni', 'jerky', 'hamburger'
];

export const nonVegetarianIngredients = [
  ...meatIngredients, 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 
  'clam', 'mussel', 'oyster', 'scallop', 'seafood', 'anchovy', 'caviar', 
  'squid', 'octopus', 'gelatin'
];

export const dairyIngredients = [
  'milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'whey',
  'lactose', 'parmesan', 'mozzarella', 'cheddar', 'ice cream'
];

// Function to check if a recipe contains forbidden ingredients
export const containsForbiddenIngredients = (recipe, forbiddenList) => {
  // Check if any ingredient in the recipe contains a forbidden ingredient
  return recipe.ingredients.some(ingredient => {
    const lowerIngredient = ingredient.toLowerCase();
    return forbiddenList.some(forbidden => {
      const lowerForbidden = forbidden.toLowerCase();
      
      // Split ingredient into words
      const words = lowerIngredient.split(/\s+|,|;|\(|\)|\/|-/);
      
      // Check if the forbidden ingredient is a complete word in the ingredient
      // This prevents "rice" from matching "rice vinegar"
      return words.some(word => word === lowerForbidden) ||
             // Also check if it's at the beginning followed by a non-word character
             lowerIngredient.match(new RegExp(`^${lowerForbidden}\\b`)) ||
             // Or at the end preceded by a non-word character
             lowerIngredient.match(new RegExp(`\\b${lowerForbidden}$`));
    });
  });
};

// Utility for checking if an ingredient matches a search term
export const ingredientMatches = (recipeIngredient, searchIngredient) => {
  // Convert both to lowercase for case-insensitive matching
  const lowerRecipeIng = recipeIngredient.toLowerCase();
  const lowerSearchIng = searchIngredient.toLowerCase();
  
  // For short ingredients (3 chars or less), just use simple contains
  if (lowerSearchIng.length <= 3) {
    return lowerRecipeIng.includes(lowerSearchIng);
  }
  
  // Simple contains check (most permissive)
  const simpleContains = lowerRecipeIng.includes(lowerSearchIng);
  
  // Split the recipe ingredient into words
  const words = lowerRecipeIng.split(/\s+|,|;|\(|\)|\/|-/);
  
  // Properly escape the search ingredient for regex
  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };
  
  const escapedSearchIng = escapeRegExp(lowerSearchIng);
  
  // Check if the search ingredient is a complete word in the recipe ingredient
  const isExactMatch = words.includes(lowerSearchIng);
  
  // Create properly escaped regex patterns
  const startPattern = new RegExp(`^${escapedSearchIng}\\b`);
  const endPattern = new RegExp(`\\b${escapedSearchIng}$`);
  
  const isStartMatch = startPattern.test(lowerRecipeIng);
  const isEndMatch = endPattern.test(lowerRecipeIng);
  
  // Also check if ingredient is contained as a whole word
  const wholeWordPattern = new RegExp(`\\b${escapedSearchIng}\\b`);
  const isWholeWordMatch = wholeWordPattern.test(lowerRecipeIng);
  
  // For shorter ingredients (like "egg", "ham", etc), be more permissive
  const isShortIngredient = lowerSearchIng.length <= 4;
  
  // If it's a short ingredient, accept it if it's contained anywhere
  return isExactMatch || isStartMatch || isEndMatch || isWholeWordMatch || (isShortIngredient && simpleContains);
};

// Filter recipes based on dietary restrictions
export const applyDietaryFilters = (recipesToFilter, filters) => {
  if (!recipesToFilter) return [];
  
  return recipesToFilter.filter(recipe => {
    // Filter by vegetarian
    if (filters.vegetarian && containsForbiddenIngredients(recipe, nonVegetarianIngredients)) {
      return false;
    }
    
    // Filter by vegan
    if (filters.vegan && (
      containsForbiddenIngredients(recipe, nonVegetarianIngredients) || 
      containsForbiddenIngredients(recipe, dairyIngredients)
    )) {
      return false;
    }
    
    // Add other filters here (gluten-free, dairy-free, etc.) if needed
    
    return true;
  });
};

// Apply client-side filtering for flexible ingredient matching
export const filterRecipesByIngredients = (recipes, ingredients) => {
  if (!recipes || !ingredients || ingredients.length === 0) {
    return recipes;
  }
  
  // If we only have 1-2 ingredients, use more lenient matching (match any)
  const shouldMatchAll = ingredients.length >= 3;
  
  return recipes.filter(recipe => {
    if (shouldMatchAll) {
      // Match all ingredients (stricter)
      return ingredients.every(searchIngredient => {
        return recipe.ingredients.some(recipeIng => 
          ingredientMatches(recipeIng, searchIngredient)
        );
      });
    } else {
      // Match any ingredient (more lenient)
      const matchCount = ingredients.filter(searchIngredient => {
        return recipe.ingredients.some(recipeIng => 
          ingredientMatches(recipeIng, searchIngredient)
        );
      }).length;
      
      // Require at least one match
      return matchCount >= 1;
    }
  });
};

// Helper function to rank recipes by how many ingredients they match
export const rankRecipesByIngredientMatches = (recipes, searchIngredients) => {
  // Calculate the match score for each recipe
  return recipes.map(recipe => {
    let matchCount = 0;
    const matchDetails = [];
    
    // Check each search ingredient against recipe ingredients
    searchIngredients.forEach(searchIng => {
      const found = recipe.ingredients.some(recipeIng => 
        ingredientMatches(recipeIng, searchIng)
      );
      if (found) {
        matchCount++;
        matchDetails.push(searchIng);
      }
    });
    
    // Return recipe with match score
    return {
      ...recipe,
      matchScore: matchCount,
      matchDetails: matchDetails,
      searchIngredients: searchIngredients, 
      matchPercentage: (matchCount / searchIngredients.length) * 100
    };
  })
  // Sort by match score (highest first)
  .sort((a, b) => b.matchScore - a.matchScore);
}; 