import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [imageQuery, setImageQuery] = useState('');
  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('recipe'); // 'recipe' or 'detect'
  const [errorMessage, setErrorMessage] = useState('');
  const [detectLoading, setDetectLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [detectImage, setDetectImage] = useState(null);
  const [detectRecipes, setDetectRecipes] = useState([]);
  const [detectFilteredRecipes, setDetectFilteredRecipes] = useState([]);
  const [detectError, setDetectError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showDietaryDropdown, setShowDietaryDropdown] = useState(false);
  const dietaryDropdownRef = useRef(null);
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false
  });
  
  const [cookingTimeFilter, setCookingTimeFilter] = useState('any'); // 'any', 'under15', 'under30', 'under60'
  const [cuisineFilter, setCuisineFilter] = useState('any'); // 'any', 'italian', 'mexican', 'asian', 'american', 'indian', etc.
  const [mealTypeFilter, setMealTypeFilter] = useState('any'); // 'any', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack'
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [totalResults, setTotalResults] = useState(0);
  const [maxResultsToShow, setMaxResultsToShow] = useState(100); // Limit for display purposes

  // Add lists for non-vegan/vegetarian ingredients to filter out
  const meatIngredients = [
    'beef', 'pork', 'lamb', 'chicken', 'turkey', 'bacon', 'ham', 'sausage', 
    'veal', 'venison', 'duck', 'goose', 'meat', 'steak', 'ribs', 'brisket',
    'prosciutto', 'salami', 'pepperoni', 'jerky', 'hamburger'
  ];

  const nonVegetarianIngredients = [
    ...meatIngredients, 'fish', 'salmon', 'tuna', 'shrimp', 'crab', 'lobster', 
    'clam', 'mussel', 'oyster', 'scallop', 'seafood', 'anchovy', 'caviar', 
    'squid', 'octopus', 'gelatin'
  ];

  const dairyIngredients = [
    'milk', 'cheese', 'butter', 'cream', 'yogurt', 'dairy', 'whey',
    'lactose', 'parmesan', 'mozzarella', 'cheddar', 'ice cream'
  ];

  // Function to check if a recipe contains forbidden ingredients
  const containsForbiddenIngredients = (recipe, forbiddenList) => {
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

  // Add precise ingredient matching helper function
  const ingredientMatches = (recipeIngredient, searchIngredient) => {
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
    const hasMatch = isExactMatch || isStartMatch || isEndMatch || isWholeWordMatch || (isShortIngredient && simpleContains);
    
    return hasMatch;
  };

  // Apply client-side filtering for flexible ingredient matching
  const filterRecipesByIngredients = (recipes, ingredients) => {
    if (!recipes || !ingredients || ingredients.length === 0) {
      console.log("No recipes or ingredients to filter");
      return recipes;
    }
    
    console.log(`Filtering ${recipes.length} recipes with ingredients: ${JSON.stringify(ingredients)}`);
    
    // If we only have 1-2 ingredients, use more lenient matching (match any)
    const shouldMatchAll = ingredients.length >= 3;
    console.log(`Using ${shouldMatchAll ? 'match all' : 'match any'} strategy for ${ingredients.length} ingredients`);
    
    const filteredRecipes = recipes.filter(recipe => {
      if (shouldMatchAll) {
        // Match all ingredients (stricter)
        const allIngredientsMatch = ingredients.every(searchIngredient => {
          const hasMatch = recipe.ingredients.some(recipeIng => 
            ingredientMatches(recipeIng, searchIngredient)
          );
          return hasMatch;
        });
        return allIngredientsMatch;
      } else {
        // Match any ingredient (more lenient)
        const matchCount = ingredients.filter(searchIngredient => {
          return recipe.ingredients.some(recipeIng => 
            ingredientMatches(recipeIng, searchIngredient)
          );
        }).length;
        
        // Require at least one match
        const hasEnoughMatches = matchCount >= 1;
        return hasEnoughMatches;
      }
    });
    
    console.log(`Filtered from ${recipes.length} to ${filteredRecipes.length} recipes`);
    return filteredRecipes;
  };

  // Filter recipes based on dietary restrictions
  const applyDietaryFilters = (recipesToFilter, filters = dietaryFilters) => {
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
      
      // Add other filters here if needed
      
      return true;
    });
  };

  // Detect if mobile on client side
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dietaryDropdownRef.current && !dietaryDropdownRef.current.contains(event.target)) {
        setShowDietaryDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dietaryDropdownRef]);
  
  // Apply dietary filters when recipes or filters change
  useEffect(() => {
    setFilteredRecipes(applyDietaryFilters(recipes));
  }, [recipes, dietaryFilters]);
  
  // Real-time search effect - fetch results as the user types
  useEffect(() => {
    // Debounce to prevent too many API calls
    const debounceTimeout = setTimeout(() => {
      if (ingredients.trim().length > 0) {
        handleSearchChange();
      }
    }, 500); // 500ms debounce to give more time for typing
    
    return () => clearTimeout(debounceTimeout);
  }, [ingredients]); // Run when ingredients change
  
  // Reset pagination when search terms or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [ingredients, dietaryFilters, cookingTimeFilter, cuisineFilter, mealTypeFilter]);
  
  // Extracted function to handle search logic without causing infinite loops
  const handleSearchChange = async (page = currentPage) => {
    if (!ingredients.trim()) return;
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Determine if input uses commas or spaces
      const hasCommas = ingredients.includes(',');
      
      // Process input based on delimiter
      let ingredientsArray;
      if (hasCommas) {
        // Handle comma-separated input
        ingredientsArray = ingredients.split(',').map(i => i.trim()).filter(i => i);
      } else {
        // Handle space-separated input
        ingredientsArray = ingredients.split(' ').map(i => i.trim()).filter(i => i);
      }
      
      // Convert all ingredients to lowercase for consistent matching
      ingredientsArray = ingredientsArray.map(ing => ing.toLowerCase());
      
      // Allow searching with fewer ingredients
      if (ingredientsArray.length === 0) {
        setErrorMessage('Please enter at least one ingredient');
        setLoading(false);
        return;
      }
      
      // Log for debugging
      console.log('Searching for ingredients:', ingredientsArray);
      
      // Add active dietary filters to the request
      const activeFilters = Object.entries(dietaryFilters)
        .filter(([_, isActive]) => isActive)
        .map(([filter]) => filter);
      
      // Add additional filters if they're not set to 'any'
      const additionalFilters = {};
      if (cookingTimeFilter !== 'any') {
        additionalFilters.cookingTime = cookingTimeFilter;
      }
      if (cuisineFilter !== 'any') {
        additionalFilters.cuisine = cuisineFilter;
      }
      if (mealTypeFilter !== 'any') {
        additionalFilters.mealType = mealTypeFilter;
      }
      
      // Use flexible matching for fewer ingredients
      // Set matchAll to false for 1-2 ingredients, true for 3+
      const useStrictMatching = ingredientsArray.length >= 3;
      
      // Add pagination parameters with max_results to limit the total results returned
      const paginationParams = {
        page: page,
        page_size: pageSize,
        max_results: 100 // Limit total results to avoid performance issues
      };
      
      console.log('API request payload:', { 
        ingredients: ingredientsArray,
        dietary: activeFilters.length > 0 ? activeFilters : undefined,
        matchAll: useStrictMatching,
        ...additionalFilters,
        ...paginationParams
      });
      
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL,
        { 
          ingredients: ingredientsArray,
          dietary: activeFilters.length > 0 ? activeFilters : undefined,
          matchAll: useStrictMatching, // More flexible matching for fewer ingredients
          ...additionalFilters,
          ...paginationParams
        }
      );
      
      console.log('Search response data:', response.data);
      console.log('Recipes from API:', response.data.recipes ? response.data.recipes.length : 0);
      console.log('First 2 recipes sample:', response.data.recipes?.slice(0, 2));
      let recipesData = response.data.recipes || [];
      
      // Store pagination information if it's available
      if (response.data.pagination) {
        setPagination(response.data.pagination);
        // Limit the total displayed for better UX if it's very large
        const rawTotal = response.data.pagination.total || recipesData.length;
        setTotalResults(Math.min(rawTotal, maxResultsToShow));
        
        // If the total is very high, update maxResultsToShow to match what the API is actually returning
        if (rawTotal > maxResultsToShow) {
          setMaxResultsToShow(Math.min(rawTotal, 100)); // Cap at 100 for performance
        }
      } else {
        setPagination(null);
        setTotalResults(recipesData.length);
      }
      
      // Sort recipes by relevance (how many ingredients they match)
      console.log('Before ranking - recipe count:', recipesData.length);
      recipesData = rankRecipesByIngredientMatches(recipesData, ingredientsArray);
      console.log('After ranking - recipe count:', recipesData.length);
      
      setRecipes(recipesData);
      
      // Show a message if no recipes found
      if (recipesData.length === 0) {
        const filterMessage = activeFilters.length > 0 
          ? ` matching your dietary preferences (${activeFilters.join(', ')})`
          : '';
        const matchStrategy = ingredientsArray.length >= 3 ? 'all' : 'any';
        setErrorMessage(`No recipes found with ${matchStrategy} of these ingredients${filterMessage}. Try different ingredients or filters.`);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
      setErrorMessage('Failed to fetch recipes. Please try again.');
    }
    setLoading(false);
  };

  // Apply dietary filters to detected recipes
  useEffect(() => {
    setDetectFilteredRecipes(applyDietaryFilters(detectRecipes));
  }, [detectRecipes, dietaryFilters]);

  // Log the backend URL for debugging
  console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

  // Helper function to rank recipes by how many ingredients they match
  const rankRecipesByIngredientMatches = (recipes, searchIngredients) => {
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
        searchIngredients: searchIngredients, // Store the search ingredients
        matchPercentage: (matchCount / searchIngredients.length) * 100
      };
    })
    // Sort by match score (highest first)
    .sort((a, b) => b.matchScore - a.matchScore);
  };

  const searchImages = async () => {
    if (!imageQuery.trim()) return;
    
    setImageLoading(true);
    setErrorMessage('');
    setImages([]);
    
    try {
      const response = await axios.post('/api/imageSearch', { query: imageQuery });
      setImages(response.data.images || []);
      if (response.data.images.length === 0) {
        setErrorMessage('No image results found. Try a different query.');
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setImages([]);
      setErrorMessage(
        error.response?.data?.error || 
        'Failed to search images. Please check if API keys are configured correctly.'
      );
    }
    setImageLoading(false);
  };

  const handleDetectImageChange = (e) => {
    setDetectImage(e.target.files[0]);
    setDetectedIngredients([]);
    setDetectRecipes([]);
    setDetectError('');
  };

  const handleDetectSubmit = async (e) => {
    e.preventDefault();
    if (!detectImage) return;
    setDetectLoading(true);
    setDetectError('');
    setDetectedIngredients([]);
    setDetectRecipes([]);
    try {
      const formData = new FormData();
      formData.append('image', detectImage);
      const response = await axios.post('/api/detectIngredients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const detected = response.data.ingredients || [];
      console.log('Detected ingredients:', detected);
      setDetectedIngredients(detected);
      
      // Check if we got a message about no food ingredients
      if (detected.length === 0 && response.data.message) {
        setDetectError(response.data.message);
        return;
      }
      
      if (detected.length > 0) {
        // Search for recipes using detected ingredients
        console.log('Searching for recipes with detected ingredients:', detected);
        
        // Add active dietary filters to the request
        const activeFilters = Object.entries(dietaryFilters)
          .filter(([_, isActive]) => isActive)
          .map(([filter]) => filter);
          
        console.log('Applied dietary filters:', activeFilters);
        
        // Only proceed if we have at least 3 ingredients
        if (detected.length < 3) {
          setDetectError('Not enough ingredients detected. Please try a different image with at least 3 visible ingredients.');
          setDetectLoading(false);
          return;
        }
        
        // Add additional filters if they're not set to 'any'
        const additionalFilters = {};
        if (cookingTimeFilter !== 'any') {
          additionalFilters.cookingTime = cookingTimeFilter;
        }
        if (cuisineFilter !== 'any') {
          additionalFilters.cuisine = cuisineFilter;
        }
        if (mealTypeFilter !== 'any') {
          additionalFilters.mealType = mealTypeFilter;
        }
        
        const recipeResp = await axios.post(
          process.env.NEXT_PUBLIC_BACKEND_URL,
          { 
            ingredients: detected,
            dietary: activeFilters.length > 0 ? activeFilters : undefined,
            matchAll: false, // More flexible matching for detection
            ...additionalFilters
          }
        );
        console.log('Recipe response:', recipeResp.data);
        
        // Apply client-side filtering for precise ingredient matching
        let recipesData = recipeResp.data.recipes || [];
        recipesData = filterRecipesByIngredients(recipesData, detected);
        
        setDetectRecipes(recipesData);
        
        // Show a message if no recipes found
        if (recipesData.length === 0) {
          const filterMessage = activeFilters.length > 0 
            ? ` matching your dietary preferences (${activeFilters.join(', ')})`
            : '';
          setDetectError(`No recipes found with all detected ingredients${filterMessage}. Try a different image or adjust dietary filters.`);
        }
      }
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      setDetectError(
        error.response?.data?.error ||
        'Failed to detect ingredients. Please try again.'
      );
    }
    setDetectLoading(false);
  };

  // Handler for toggling dietary filters
  const toggleDietaryFilter = (filter) => {
    const newFilters = {
      ...dietaryFilters,
      [filter]: !dietaryFilters[filter]
    };
    
    // If vegan is turned on, automatically turn on vegetarian too
    if (filter === 'vegan' && !dietaryFilters.vegan) {
      newFilters.vegetarian = true;
    }
    
    // Instantly apply filters for immediate visual feedback
    setFilteredRecipes(applyDietaryFilters(recipes, newFilters));
    setDetectFilteredRecipes(applyDietaryFilters(detectRecipes, newFilters));
    
    // Then update the filter state
    setDietaryFilters(newFilters);
  };

  // Function to share a recipe
  const shareRecipe = async (recipe, e) => {
    e.stopPropagation(); // Prevent expanding the recipe
    
    // Ensure the recipe has an ID
    if (!recipe.id) {
      recipe = { ...recipe, id: `recipe-${Date.now()}` };
    }
    
    // Store recipes in sessionStorage for retrieval on detail page
    if (typeof window !== 'undefined') {
      try {
        // Get existing stored recipes or initialize an empty array
        const storedRecipes = sessionStorage.getItem('recipeData') 
          ? JSON.parse(sessionStorage.getItem('recipeData')) 
          : [];

        // Add current recipe if it doesn't exist
        if (!storedRecipes.some(r => r.id === recipe.id)) {
          storedRecipes.push(recipe);
          sessionStorage.setItem('recipeData', JSON.stringify(storedRecipes));
        }
      } catch (err) {
        console.error('Error storing recipe data:', err);
      }
    }
    
    // Create a shareable URL
    const recipeData = encodeURIComponent(JSON.stringify(recipe));
    const shareUrl = `${window.location.origin}/recipe/${recipe.id}?data=${recipeData}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: shareUrl
        });
        return;
      } catch (err) {
        console.log('Error sharing:', err);
        // Fall back to clipboard
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // If clipboard API fails, show the URL and ask user to copy manually
      alert(`Please copy this link manually: ${shareUrl}`);
    }
  };
  
  // Open recipe in new tab
  const openRecipeInNewTab = (recipe, e) => {
    e.stopPropagation(); // Prevent expanding the recipe
    
    // Ensure the recipe has an ID
    if (!recipe.id) {
      recipe = { ...recipe, id: `recipe-${Date.now()}` };
    }
    
    // Store recipes in sessionStorage for retrieval on detail page
    if (typeof window !== 'undefined') {
      try {
        // Get existing stored recipes or initialize an empty array
        const storedRecipes = sessionStorage.getItem('recipeData') 
          ? JSON.parse(sessionStorage.getItem('recipeData')) 
          : [];

        // Add current recipe if it doesn't exist
        if (!storedRecipes.some(r => r.id === recipe.id)) {
          storedRecipes.push(recipe);
          sessionStorage.setItem('recipeData', JSON.stringify(storedRecipes));
        }
        
        // Create a shareable URL with recipe data in the query params
        const recipeData = encodeURIComponent(JSON.stringify(recipe));
        const recipeUrl = `/recipe/${recipe.id}?data=${recipeData}`;
        
        // Open in new tab
        window.open(recipeUrl, '_blank');
      } catch (err) {
        console.error('Error storing recipe data:', err);
      }
    }
  };

  // Update the filteredRecipes array to ensure each recipe has an ID
  useEffect(() => {
    if (recipes.length > 0) {
      // Add IDs to recipes if they don't have one
      const recipesWithIds = recipes.map((recipe, index) => {
        if (!recipe.id) {
          return { ...recipe, id: `recipe-${index}-${Date.now()}` };
        }
        return recipe;
      });
      setRecipes(recipesWithIds);
    }
  }, [recipes]);

  // Update the detectFilteredRecipes array to ensure each recipe has an ID
  useEffect(() => {
    if (detectRecipes.length > 0) {
      // Add IDs to recipes if they don't have one
      const recipesWithIds = detectRecipes.map((recipe, index) => {
        if (!recipe.id) {
          return { ...recipe, id: `recipe-${index}-${Date.now()}` };
        }
        return recipe;
      });
      setDetectRecipes(recipesWithIds);
    }
  }, [detectRecipes]);

  const RecipeCard = ({ title, ingredients, directions }) => {
    const [expanded, setExpanded] = useState(false);
    const short = directions.slice(0, 300);

    return (
      <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
        <h3>{title}</h3>
        <p><strong>Ingredients:</strong> {ingredients.join(', ')}</p>
        <p>
          <strong>Directions:</strong>{' '}
          {expanded ? directions.join(' ') : short.join(' ') + '... '}
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? 'See Less' : 'See More'}
          </button>
        </p>
      </div>
    );
  };

  const fetchRecipes = async (page = currentPage) => {
    // Reset recipes state before searching
    if (page === 1) {
      setRecipes([]);
      setFilteredRecipes([]);
    }
    
    // Then call the search handler with the specified page
    handleSearchChange(page);
  };

  // Function to handle page changes
  const handlePageChange = (newPage) => {
    if (newPage < 1 || (pagination && newPage > pagination.pages)) return;
    
    setCurrentPage(newPage);
    fetchRecipes(newPage);
    
    // Scroll to the top of the results
    const resultsSection = document.getElementById('recipe-results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper function to generate page numbers array for pagination UI
  const getPageNumbers = () => {
    if (!pagination) return [];
    
    // If pagination response includes page_numbers, use those
    if (pagination.page_numbers && pagination.page_numbers.length > 0) {
      return pagination.page_numbers;
    }
    
    // Otherwise generate page numbers to display (show up to 5 pages)
    const { page, pages } = pagination;
    const pageNumbers = [];
    
    if (pages <= 5) {
      // Show all page numbers if 5 or fewer
      for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages around the current page
      if (page <= 3) {
        // Near the start
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (page >= pages - 2) {
        // Near the end
        for (let i = pages - 4; i <= pages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        for (let i = page - 2; i <= page + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    
    return pageNumbers;
  };

  return (
    <div style={{ 
      background: "var(--background)", 
      color: "var(--foreground)", 
      padding: "2rem", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      maxWidth: "1200px",
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}
    className="main-container"
    >
      <h1 style={{ 
        textAlign: "center", 
        fontSize: "32px", 
        fontWeight: "600", 
        marginBottom: "0.5rem", 
        color: "var(--foreground)"
      }}>Recipe Finder</h1>
      <h2 style={{ 
        textAlign: "center", 
        fontSize: "18px", 
        fontWeight: "500", 
        marginBottom: "2rem", 
        color: "#0071e3",
        fontStyle: "italic"
      }}>ingreddit.com</h2>

      <div style={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "center", 
        marginBottom: "2rem",
        background: "var(--card-bg)",
        padding: "4px",
        borderRadius: "12px",
        maxWidth: "600px",
        margin: "0 auto 2rem auto",
        gap: "4px"
      }}>
        <button 
          onClick={() => setSearchMode('recipe')}
          style={{ 
            padding: "0.75rem 1rem", 
            backgroundColor: searchMode === 'recipe' ? "#ffffff" : "transparent",
            color: searchMode === 'recipe' ? "#1d1d1f" : "#1d1d1f",
            border: "none",
            borderRadius: "10px",
            fontWeight: searchMode === 'recipe' ? "600" : "400",
            fontSize: "15px",
            flex: 1,
            boxShadow: searchMode === 'recipe' ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          Search by Ingredients
        </button>
        <button 
          onClick={() => setSearchMode('detect')}
          style={{ 
            padding: "0.75rem 1rem", 
            backgroundColor: searchMode === 'detect' ? "#ffffff" : "transparent",
            color: searchMode === 'detect' ? "#1d1d1f" : "#1d1d1f",
            border: "none",
            borderRadius: "10px",
            fontWeight: searchMode === 'detect' ? "600" : "400",
            fontSize: "15px",
            flex: 1,
            boxShadow: searchMode === 'detect' ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          {isMobile ? "Detect Ingredients" : "Detect Ingredients from Image"}
        </button>
      </div>

      {errorMessage && searchMode !== 'detect' && (
        <div style={{ 
          color: "#e03131", 
          textAlign: "center", 
          margin: "1rem auto", 
          padding: "0.75rem 1rem", 
          backgroundColor: "#fff8f8",
          borderRadius: "10px",
          maxWidth: "600px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          {errorMessage}
        </div>
      )}

      {searchMode === 'recipe' ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ 
            textAlign: "center", 
            fontSize: "16px", 
            color: "#636366",
            marginBottom: "1.5rem"
          }}>
            Enter ingredients separated by commas or spaces (e.g. chicken rice garlic)
            {Object.values(dietaryFilters).some(v => v) && (
              <span style={{ display: "block", marginTop: "0.5rem", fontWeight: "500", color: "#34c759" }}>
                Active filters: {Object.entries(dietaryFilters)
                  .filter(([_, isActive]) => isActive)
                  .map(([filter]) => filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                  .join(', ')}
              </span>
            )}
            
            {/* Display active additional filters */}
            {(cookingTimeFilter !== 'any' || cuisineFilter !== 'any' || mealTypeFilter !== 'any') && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem", justifyContent: "center" }}>
                {cookingTimeFilter !== 'any' && (
                  <span style={{ 
                    display: "inline-block", 
                    padding: "0.25rem 0.75rem", 
                    backgroundColor: "rgba(0,113,227,0.1)", 
                    color: "#0071e3", 
                    borderRadius: "1rem", 
                    fontSize: "13px", 
                    fontWeight: "500" 
                  }}>
                    {cookingTimeFilter === 'under15' ? 'Under 15 mins' : 
                     cookingTimeFilter === 'under30' ? 'Under 30 mins' : 
                     cookingTimeFilter === 'under60' ? 'Under 1 hour' : ''}
                  </span>
                )}
                
                {cuisineFilter !== 'any' && (
                  <span style={{ 
                    display: "inline-block", 
                    padding: "0.25rem 0.75rem", 
                    backgroundColor: "rgba(52,199,89,0.1)", 
                    color: "#34c759", 
                    borderRadius: "1rem", 
                    fontSize: "13px", 
                    fontWeight: "500" 
                  }}>
                    {cuisineFilter.charAt(0).toUpperCase() + cuisineFilter.slice(1)}
                  </span>
                )}
                
                {mealTypeFilter !== 'any' && (
                  <span style={{ 
                    display: "inline-block", 
                    padding: "0.25rem 0.75rem", 
                    backgroundColor: "rgba(255,149,0,0.1)", 
                    color: "#ff9500", 
                    borderRadius: "1rem", 
                    fontSize: "13px", 
                    fontWeight: "500" 
                  }}>
                    {mealTypeFilter.charAt(0).toUpperCase() + mealTypeFilter.slice(1)}
                  </span>
                )}
              </div>
            )}
          </p>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "0.75rem", 
            marginBottom: "2rem" 
          }}>
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
            }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchRecipes();
                  }
                }}
                placeholder="e.g. rice chicken garlic"
                style={{ 
                  padding: "0.85rem 1rem", 
                  paddingRight: "3.5rem",
                  width: "100%", 
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "16px",
                  backgroundColor: "var(--card-bg)",
                  color: "var(--foreground)",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              />
              <button 
                onClick={fetchRecipes} 
                style={{ 
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.5rem",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#0071e3",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,113,227,0.3)",
                  transition: "all 0.2s ease"
                }}
                disabled={loading}
                aria-label="Search recipes"
              >
                {loading ? (
                  <span style={{ fontSize: "12px" }}>...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
                  </svg>
                )}
              </button>
            </div>
            <div style={{ position: "relative", zIndex: 10 }} ref={dietaryDropdownRef}>
              <button
                onClick={() => setShowDietaryDropdown(!showDietaryDropdown)}
                style={{ 
                  padding: "0.85rem 1rem",
                  backgroundColor: "var(--card-bg)",
                  color: (Object.values(dietaryFilters).some(v => v) || cookingTimeFilter !== 'any' || cuisineFilter !== 'any' || mealTypeFilter !== 'any') 
                    ? "#34c759" : "var(--primary)",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap"
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: showDietaryDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                  <path d="M12 9L20 16H4L12 9Z" fill={(Object.values(dietaryFilters).some(v => v) || cookingTimeFilter !== 'any' || cuisineFilter !== 'any' || mealTypeFilter !== 'any') ? "#34c759" : "#0071e3"} />
                </svg>
                <span>Filters</span>
                {(Object.values(dietaryFilters).some(v => v) || cookingTimeFilter !== 'any' || cuisineFilter !== 'any' || mealTypeFilter !== 'any') && (
                  <div style={{
                    width: "6px",
                    height: "6px",
                    backgroundColor: "#34c759",
                    borderRadius: "50%",
                    marginLeft: "-2px"
                  }} />
                )}
              </button>
              
              {showDietaryDropdown && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "220px",
                  background: "var(--card-bg)",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  padding: "1rem",
                  zIndex: 20
                }}>
                  <div style={{ 
                    borderBottom: "1px solid #f2f2f7", 
                    paddingBottom: "0.75rem", 
                    marginBottom: "1rem" 
                  }}>
                    <h3 style={{ 
                      fontSize: "16px", 
                      fontWeight: "600", 
                      color: "var(--foreground)", 
                      margin: 0 
                    }}>
                      Dietary Preferences
                    </h3>
                  </div>
                  
                  {Object.entries(dietaryFilters).map(([filter, isActive]) => (
                    <div key={filter} style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid #f2f2f7"
                    }}>
                      <span style={{ fontSize: "14px", color: "var(--foreground)" }}>
                        {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      
                      <div
                        onClick={() => toggleDietaryFilter(filter)}
                        style={{
                          width: "40px",
                          height: "24px",
                          backgroundColor: isActive ? "#34c759" : "#d1d1d6",
                          borderRadius: "12px",
                          padding: "2px",
                          position: "relative",
                          transition: "background-color 0.2s ease",
                          cursor: "pointer"
                        }}
                      >
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            backgroundColor: "white",
                            borderRadius: "50%",
                            position: "absolute",
                            top: "2px",
                            left: isActive ? "18px" : "2px",
                            transition: "left 0.2s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  
                  {/* Cooking Time Filter */}
                  <div style={{ 
                    borderTop: "1px solid #f2f2f7",
                    borderBottom: "1px solid #f2f2f7", 
                    paddingTop: "1rem",
                    paddingBottom: "0.75rem", 
                    marginTop: "1rem",
                    marginBottom: "0.75rem" 
                  }}>
                    <h3 style={{ 
                      fontSize: "16px", 
                      fontWeight: "600", 
                      color: "var(--foreground)", 
                      margin: "0 0 0.75rem 0" 
                    }}>
                      Cooking Time (Est.)
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { value: 'any', label: 'Any Time' },
                        { value: 'under15', label: 'Under 15 Minutes' },
                        { value: 'under30', label: 'Under 30 Minutes' },
                        { value: 'under60', label: 'Under 1 Hour' }
                      ].map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setCookingTimeFilter(option.value)}
                          style={{ 
                            display: "flex", 
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            backgroundColor: cookingTimeFilter === option.value ? "rgba(0,113,227,0.1)" : "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid #0071e3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {cookingTimeFilter === option.value && (
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#0071e3"
                              }} />
                            )}
                          </div>
                          <span style={{ fontSize: "14px", color: "var(--foreground)" }}>
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Cuisine Type Filter */}
                  <div style={{ 
                    borderBottom: "1px solid #f2f2f7", 
                    paddingBottom: "0.75rem", 
                    marginBottom: "0.75rem" 
                  }}>
                    <h3 style={{ 
                      fontSize: "16px", 
                      fontWeight: "600", 
                      color: "var(--foreground)", 
                      margin: "0 0 0.75rem 0" 
                    }}>
                      Cuisine Type
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { value: 'any', label: 'Any Cuisine' },
                        { value: 'italian', label: 'Italian' },
                        { value: 'mexican', label: 'Mexican' },
                        { value: 'asian', label: 'Asian' },
                        { value: 'american', label: 'American' },
                        { value: 'indian', label: 'Indian' }
                      ].map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setCuisineFilter(option.value)}
                          style={{ 
                            display: "flex", 
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            backgroundColor: cuisineFilter === option.value ? "rgba(0,113,227,0.1)" : "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid #0071e3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {cuisineFilter === option.value && (
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#0071e3"
                              }} />
                            )}
                          </div>
                          <span style={{ fontSize: "14px", color: "#1d1d1f" }}>
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Meal Type Filter */}
                  <div style={{ 
                    paddingBottom: "0.75rem", 
                    marginBottom: "0.75rem" 
                  }}>
                    <h3 style={{ 
                      fontSize: "16px", 
                      fontWeight: "600", 
                      color: "#1d1d1f", 
                      margin: "0 0 0.75rem 0" 
                    }}>
                      Meal Type
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {[
                        { value: 'any', label: 'Any Meal' },
                        { value: 'breakfast', label: 'Breakfast' },
                        { value: 'lunch', label: 'Lunch' },
                        { value: 'dinner', label: 'Dinner' },
                        { value: 'dessert', label: 'Dessert' },
                        { value: 'snack', label: 'Snack' }
                      ].map(option => (
                        <div 
                          key={option.value}
                          onClick={() => setMealTypeFilter(option.value)}
                          style={{ 
                            display: "flex", 
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "6px",
                            backgroundColor: mealTypeFilter === option.value ? "rgba(0,113,227,0.1)" : "transparent",
                            cursor: "pointer",
                            transition: "background-color 0.2s ease"
                          }}
                        >
                          <div style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid #0071e3",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {mealTypeFilter === option.value && (
                              <div style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#0071e3"
                              }} />
                            )}
                          </div>
                          <span style={{ fontSize: "14px", color: "#1d1d1f" }}>
                            {option.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {Object.values(dietaryFilters).some(v => v) || 
                   cookingTimeFilter !== 'any' || 
                   cuisineFilter !== 'any' || 
                   mealTypeFilter !== 'any' ? (
                    <button
                      onClick={() => {
                        setDietaryFilters({
                          vegetarian: false,
                          vegan: false,
                          glutenFree: false,
                          dairyFree: false,
                          lowCarb: false
                        });
                        setCookingTimeFilter('any');
                        setCuisineFilter('any');
                        setMealTypeFilter('any');
                        setIngredients(''); // Clear search input
                        setRecipes([]); // Clear results
                        setFilteredRecipes([]); // Clear filtered results
                      }}
                      style={{
                        width: "100%",
                        padding: "0.6rem",
                        marginTop: "0.75rem",
                        backgroundColor: "transparent",
                        color: "#0071e3",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontWeight: "500",
                        cursor: "pointer"
                      }}
                    >
                      Reset All Filters
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <div id="recipe-results" style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "1.5rem", 
            justifyContent: "center" 
          }}>
            {filteredRecipes.length > 0 && (
              <div style={{ 
                width: "100%", 
                textAlign: "center", 
                margin: "0 0 1rem 0",
                color: "var(--foreground-muted)",
                fontSize: "14px"
              }}>
                Displaying {filteredRecipes.length} {filteredRecipes.length !== recipes.length ? 'filtered' : ''} results
                {totalResults > filteredRecipes.length && (
                  <span> out of {totalResults > maxResultsToShow ? `${maxResultsToShow}+` : totalResults} total</span>
                )}
                {pagination && <span> (Page {pagination.page} of {pagination.pages})</span>}
              </div>
            )}
            {filteredRecipes.map((recipe, index) => (
              <div 
                key={index} 
                style={{ 
                  background: "var(--card-bg)",
                  borderRadius: "16px", 
                  padding: "1.5rem", 
                  width: "100%", 
                  maxWidth: "350px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "pointer",
                  ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
                  },
                  position: "relative"
                }}
                className="recipe-card"
              >
                <div style={{
                  position: "absolute",
                  top: "1rem",
                  right: "1rem",
                  display: "flex",
                  gap: "8px"
                }}>
                  <button
                    onClick={(e) => shareRecipe(recipe, e)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#f5f5f7",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      padding: 0
                    }}
                    aria-label="Share recipe"
                    title="Share recipe"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="#0071e3"/>
                    </svg>
                  </button>
                  
                  <button
                    onClick={(e) => openRecipeInNewTab(recipe, e)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      backgroundColor: "#f5f5f7",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      padding: 0
                    }}
                    aria-label="Open in new tab"
                    title="Open in new tab with larger text"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#0071e3"/>
                    </svg>
                  </button>
                </div>

                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  marginTop: 0,
                  marginBottom: "0.5rem",
                  color: "var(--foreground)",
                  paddingRight: "70px"
                }}>
                  {recipe.title}
                </h3>
                
                {/* Recipe metadata tags */}
                {(recipe.cookingTime || recipe.cuisine || recipe.mealType) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                    {recipe.cookingTime && (
                      <span style={{ 
                        display: "inline-flex", 
                        alignItems: "center",
                        gap: "4px",
                        padding: "0.2rem 0.5rem", 
                        backgroundColor: "rgba(0,113,227,0.1)", 
                        color: "#0071e3", 
                        borderRadius: "0.75rem", 
                        fontSize: "12px", 
                        fontWeight: "500" 
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" fill="currentColor"/>
                          <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                        </svg>
                        {recipe.cookingTime} min
                      </span>
                    )}
                    
                    {recipe.cuisine && (
                      <span style={{ 
                        display: "inline-block", 
                        padding: "0.2rem 0.5rem", 
                        backgroundColor: "rgba(52,199,89,0.1)", 
                        color: "#34c759", 
                        borderRadius: "0.75rem", 
                        fontSize: "12px", 
                        fontWeight: "500" 
                      }}>
                        {recipe.cuisine}
                      </span>
                    )}
                    
                    {recipe.mealType && (
                      <span style={{ 
                        display: "inline-block", 
                        padding: "0.2rem 0.5rem", 
                        backgroundColor: "rgba(255,149,0,0.1)", 
                        color: "#ff9500", 
                        borderRadius: "0.75rem", 
                        fontSize: "12px", 
                        fontWeight: "500" 
                      }}>
                        {recipe.mealType}
                      </span>
                    )}
                  </div>
                )}
                
                {recipe.matchScore && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                    fontSize: "13px"
                  }}>
                    <div style={{
                      width: "100%",
                      height: "6px",
                      backgroundColor: "#f2f2f7",
                      borderRadius: "3px",
                      overflow: "hidden",
                      marginRight: "8px"
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${recipe.matchPercentage}%`,
                        backgroundColor: recipe.matchPercentage > 80 ? "#34c759" : 
                                         recipe.matchPercentage > 50 ? "#ffcc00" : "#ff9500",
                        borderRadius: "3px"
                      }}/>
                    </div>
                    <span style={{ color: "#8e8e93", whiteSpace: "nowrap" }}>
                      {recipe.matchScore} out of {recipe.searchIngredients?.length || recipe.matchDetails?.length || recipe.matchScore || 2} ingredients
                    </span>
                  </div>
                )}
                
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "var(--foreground)",
                  marginBottom: "0.5rem" 
                }}>
                  Ingredients:
                </h4>
                
                <ul style={{ 
                  paddingLeft: "1.25rem", 
                  marginBottom: "1.25rem", 
                  color: "var(--foreground)" 
                }}>
              {recipe.ingredients.slice(0, 5).map((ing, i) => (
                    <li key={i} style={{ marginBottom: "0.25rem", fontSize: "15px" }}>{ing}</li>
              ))}
            </ul>

            {recipe.directions && (
              <div>
                {expanded === index ? (
                  <div>
                        <h4 style={{ 
                          fontSize: "15px", 
                          fontWeight: "600", 
                          color: "#636366",
                          marginBottom: "0.5rem" 
                        }}>
                          Directions:
                        </h4>
                        <p style={{ 
                          fontSize: "15px", 
                          lineHeight: "1.5", 
                          color: "#1d1d1f" 
                        }}>
                          {recipe.directions.join(' ')}
                        </p>
                        <button 
                          onClick={() => setExpanded(null)}
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            marginTop: "1rem",
                            backgroundColor: "#f5f5f7",
                            color: "#0071e3",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "15px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          Show Less
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setExpanded(index)}
                        style={{
                          width: "100%",
                          padding: "0.6rem",
                          backgroundColor: "#f5f5f7",
                          color: "#0071e3",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        View Directions
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: "2rem",
                gap: "0.5rem",
                flexWrap: "wrap"
              }}>
                {/* First page button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: currentPage === 1 ? "var(--card-bg)" : "var(--primary)",
                    color: currentPage === 1 ? "var(--foreground-muted)" : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.7 : 1,
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  First
                </button>
                
                {/* Previous page button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: currentPage === 1 ? "var(--card-bg)" : "var(--primary)",
                    color: currentPage === 1 ? "var(--foreground-muted)" : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.7 : 1,
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {getPageNumbers().map(pageNum => (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: currentPage === pageNum ? "var(--primary)" : "var(--card-bg)",
                      color: currentPage === pageNum ? "white" : "var(--foreground)",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}
                  >
                    {pageNum}
                  </button>
                ))}
                
                {/* Next page button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: !pagination.has_next ? "var(--card-bg)" : "var(--primary)",
                    color: !pagination.has_next ? "var(--foreground-muted)" : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: !pagination.has_next ? "not-allowed" : "pointer",
                    opacity: !pagination.has_next ? 0.7 : 1,
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Next
                </button>
                
                {/* Last page button */}
                <button
                  onClick={() => handlePageChange(pagination.pages)}
                  disabled={currentPage === pagination.pages}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: currentPage === pagination.pages ? "var(--card-bg)" : "var(--primary)",
                    color: currentPage === pagination.pages ? "var(--foreground-muted)" : "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: currentPage === pagination.pages ? "not-allowed" : "pointer",
                    opacity: currentPage === pagination.pages ? 0.7 : 1,
                    fontSize: "14px",
                    fontWeight: "500"
                  }}
                >
                  Last
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <p style={{ 
            textAlign: "center", 
            fontSize: "16px", 
            color: "var(--foreground-muted)",
            marginBottom: "1.5rem" 
          }}>
            Upload a food image to detect ingredients and find recipes.
          </p>
          {Object.values(dietaryFilters).some(v => v) && (
            <p style={{ 
              textAlign: "center", 
              marginTop: "0.5rem", 
              marginBottom: "1rem",
              fontWeight: "500", 
              color: "#34c759" 
            }}>
              Active filters: {Object.entries(dietaryFilters)
                .filter(([_, isActive]) => isActive)
                .map(([filter]) => filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                .join(', ')}
            </p>
          )}
          <form onSubmit={handleDetectSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
              <div style={{ 
                display: 'flex', 
                width: '100%', 
                justifyContent: 'center', 
                gap: '12px',
                flexDirection: 'row'
              }}>
                <label 
                  htmlFor="uploadImage"
                  style={{ 
                    padding: "0.85rem 1rem",
                    backgroundColor: "white",
                    color: "#0071e3",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: isMobile ? 1 : "unset",
                    width: isMobile ? "auto" : "200px",
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#0071e3"/>
                  </svg>
                  <span>Select Image</span>
                  <input 
                    type="file" 
                    id="uploadImage"
                    accept="image/*" 
                    onChange={handleDetectImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                {isMobile && (
                  <label 
                    htmlFor="cameraInput"
                    style={{ 
                      padding: "0.85rem 1rem",
                      backgroundColor: "white",
                      color: "#34c759",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: 1,
                      fontSize: "16px",
                      fontWeight: "500",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      transition: "background-color 0.2s ease"
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="#34c759"/>
                      <path d="M20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#34c759"/>
                    </svg>
                    <span>Open Camera</span>
                    <input 
                      type="file" 
                      id="cameraInput"
                      accept="image/*" 
                      capture="environment"
                      onChange={handleDetectImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
              {detectImage && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <p>Selected: {detectImage.name}</p>
                  {/* Optional: Show image preview */}
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    margin: '0 auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      src={detectImage ? URL.createObjectURL(detectImage) : ''} 
                      alt="Preview" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              style={{ 
                padding: "0.85rem 1rem",
                backgroundColor: "#0071e3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: detectLoading ? "not-allowed" : "pointer",
                opacity: detectLoading ? 0.7 : 1,
                width: '100%',
                maxWidth: '400px',
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,113,227,0.3)",
                transition: "all 0.2s ease"
              }}
              disabled={detectLoading || !detectImage}
            >
              {detectLoading ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                  <span>Detecting...</span>
                </div>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
                  </svg>
                  <span>Detect Ingredients & Find Recipes</span>
                </>
              )}
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </button>
          </form>
          {detectError && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{detectError}</div>
          )}
          {detectedIngredients.length > 0 && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h3>Detected Ingredients:</h3>
              <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#f0f0f0', borderRadius: '8px' }}>
                {detectedIngredients.join(', ')}
              </div>
            </div>
          )}
          {detectFilteredRecipes.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              {detectFilteredRecipes.length > 0 && (
                <div style={{ 
                  width: "100%", 
                  textAlign: "center", 
                  margin: "0 0 1rem 0",
                  color: "var(--foreground-muted)",
                  fontSize: "14px"
                }}>
                  Displaying {detectFilteredRecipes.length} {detectFilteredRecipes.length !== detectRecipes.length ? 'filtered' : ''} results out of {detectRecipes.length} total
                </div>
              )}
              {detectFilteredRecipes.map((recipe, index) => (
                <div 
                  key={index} 
                  style={{ 
                    border: "1px solid #ddd", 
                    borderRadius: "8px", 
                    padding: "1rem", 
                    width: "300px",
                    position: "relative"
                  }}
                >
                  <div style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    display: "flex",
                    gap: "8px"
                  }}>
                    <button
                      onClick={(e) => shareRecipe(recipe, e)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#f5f5f7",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        padding: 0
                      }}
                      aria-label="Share recipe"
                      title="Share recipe"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="#0071e3"/>
                      </svg>
                    </button>
                    
                    <button
                      onClick={(e) => openRecipeInNewTab(recipe, e)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: "#f5f5f7",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        padding: 0
                      }}
                      aria-label="Open in new tab"
                      title="Open in new tab with larger text"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" fill="#0071e3"/>
                      </svg>
                    </button>
                  </div>

                  <h3 style={{ 
                    marginRight: "70px"
                  }}>
                    {recipe.title}
                  </h3>

                  <h4 style={{ 
                    fontSize: "15px", 
                    fontWeight: "600", 
                    color: "var(--foreground)",
                    marginBottom: "0.5rem" 
                  }}>
                    Ingredients:
                  </h4>
                  
                  <ul style={{ 
                    paddingLeft: "1.25rem", 
                    marginBottom: "1.25rem", 
                    color: "var(--foreground)" 
                  }}>
                    {recipe.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>

                  {recipe.directions && (
                    <div>
                      <button onClick={() => setExpanded(expanded === index ? null : index)}>
                        {expanded === index ? 'Show Less' : 'See More'}
                      </button>
                      {expanded === index && (
                        <div>
                          <h4 style={{ color: "var(--foreground)" }}>Directions:</h4>
                          <p style={{ color: "var(--foreground)" }}>{recipe.directions.join(' ')}</p>
                        </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
          )}
        </>
      )}
      <footer style={{
        marginTop: "auto",
        padding: "1.5rem",
        textAlign: "center",
        position: "relative",
        color: "var(--foreground-muted)",
        fontSize: "14px"
      }}
      className="footer"
      >
        {/* Stylistic divider */}
        <div className="footer-divider" style={{
          position: "absolute",
          top: 0,
          left: "5%",
          right: "5%",
          height: "1px",
          backgroundColor: "var(--border-color)"
        }} />
        <p style={{ marginBottom: "0.75rem", paddingTop: "1.5rem" }}>Niv & Gal © 2025</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "13px" }}>Dark mode:</span>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  );
}

