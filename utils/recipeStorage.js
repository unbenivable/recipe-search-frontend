// Store recipe in session storage
export const storeRecipe = (recipe) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Ensure the recipe has an ID
    if (!recipe.id) {
      recipe = { ...recipe, id: `recipe-${Date.now()}` };
    }
    
    // Get existing stored recipes or initialize an empty array
    const storedRecipes = sessionStorage.getItem('recipeData') 
      ? JSON.parse(sessionStorage.getItem('recipeData')) 
      : [];

    // Add current recipe if it doesn't exist
    if (!storedRecipes.some(r => r.id === recipe.id)) {
      storedRecipes.push(recipe);
      sessionStorage.setItem('recipeData', JSON.stringify(storedRecipes));
    }
    
    return recipe;
  } catch (err) {
    console.error('Error storing recipe data:', err);
    return recipe;
  }
};

// Get a recipe's shareable URL
export const getRecipeUrl = (recipe) => {
  if (typeof window === 'undefined') return '';
  
  // Ensure recipe has an ID
  const recipeWithId = storeRecipe(recipe);
  
  // Create a shareable URL with recipe data in the query params
  const recipeData = encodeURIComponent(JSON.stringify(recipeWithId));
  return `/recipe/${recipeWithId.id}?data=${recipeData}`;
};

// Share a recipe using Web Share API or clipboard
export const shareRecipe = async (recipe) => {
  if (typeof window === 'undefined') return;
  
  // Store the recipe and get its URL
  const recipeWithId = storeRecipe(recipe);
  const shareUrl = `${window.location.origin}${getRecipeUrl(recipeWithId)}`;
  
  // Try to use the Web Share API if available
  if (navigator.share) {
    try {
      await navigator.share({
        title: recipeWithId.title,
        text: `Check out this recipe for ${recipeWithId.title}!`,
        url: shareUrl
      });
      return true;
    } catch (err) {
      console.log('Error sharing:', err);
      // Fall back to clipboard
    }
  }
  
  // Fallback: Copy to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    // If clipboard API fails, show the URL and ask user to copy manually
    alert(`Please copy this link manually: ${shareUrl}`);
    return false;
  }
};

// Open recipe in new tab
export const openRecipeInNewTab = (recipe) => {
  if (typeof window === 'undefined') return;
  
  // Store the recipe
  const recipeWithId = storeRecipe(recipe);
  
  // Get the URL and open in new tab
  const recipeUrl = getRecipeUrl(recipeWithId);
  window.open(recipeUrl, '_blank');
};

// Ensure all recipes in a collection have IDs
export const ensureRecipesHaveIds = (recipes) => {
  if (!recipes || !recipes.length) return recipes;
  
  return recipes.map((recipe, index) => {
    if (!recipe.id) {
      return { ...recipe, id: `recipe-${index}-${Date.now()}` };
    }
    return recipe;
  });
}; 