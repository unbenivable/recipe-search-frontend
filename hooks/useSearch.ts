import { useState, useRef, useCallback, useEffect } from 'react';
import { fetchRecipesFromAPI } from '../utils/api';
import { 
  filterRecipesByIngredients, 
  rankRecipesByIngredientMatches 
} from '../utils/recipeFilters';
import { ensureRecipesHaveIds } from '../utils/recipeStorage';
import { Recipe, DietaryFilters, SearchHookState } from '@/types';

interface SearchCache {
  [key: string]: {
    recipes: Recipe[];
    pagination: Pagination | null;
    totalResults: number;
    timestamp: number;
  }
}

interface Pagination {
  page: number;
  pages: number;
  total?: number;
  page_numbers?: number[];
}

export const useSearch = (initialIngredients = ''): SearchHookState => {
  const [ingredients, setIngredients] = useState<string>(initialIngredients);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [maxResultsToShow, setMaxResultsToShow] = useState<number>(100);
  
  // Cache for search results to reduce API calls
  const [searchCache, setSearchCache] = useState<SearchCache>({});
  const searchRequestRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchParamsRef = useRef<string>('');
  const lastManualSearchRef = useRef<number>(0);
  const autoSearchEnabledRef = useRef<boolean>(false);
  
  // For rate limiting
  const [searchAttempts, setSearchAttempts] = useState<number>(0);
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const rateLimitTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Filter settings
  const [dietaryFilters, setDietaryFilters] = useState<DietaryFilters>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false
  });
  const [cookingTimeFilter, setCookingTimeFilter] = useState<string>('any');
  const [cuisineFilter, setCuisineFilter] = useState<string>('any');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('any');
  
  // Toggle a dietary filter
  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters(prev => {
      const newFilters = {
        ...prev,
        [filter]: !prev[filter]
      };
      
      // If vegan is turned on, automatically turn on vegetarian too
      if (filter === 'vegan' && !prev.vegan) {
        newFilters.vegetarian = true;
      }
      
      return newFilters;
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
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
  };
  
  // Process ingredients string into an array
  const processIngredients = (ingredientsString: string): string[] => {
    if (!ingredientsString.trim()) return [];
    
    // Determine if input uses commas or spaces
    const hasCommas = ingredientsString.includes(',');
    
    // Process input based on delimiter
    let ingredientsArray: string[];
    if (hasCommas) {
      // Handle comma-separated input
      ingredientsArray = ingredientsString.split(',').map(i => i.trim()).filter(i => i);
    } else {
      // Handle space-separated input
      ingredientsArray = ingredientsString.split(' ').map(i => i.trim()).filter(i => i);
    }
    
    // Convert all ingredients to lowercase for consistent matching
    return ingredientsArray.map(ing => ing.toLowerCase());
  };
  
  // Core search function
  const performSearch = useCallback((page = currentPage, manual = false) => {
    // Generate consistent cache key for all search params
    const searchParams = `${ingredients}-${JSON.stringify(dietaryFilters)}-${cookingTimeFilter}-${cuisineFilter}-${mealTypeFilter}-${page}`;
    
    // Skip duplicate searches and rate limited situations
    if (isRateLimited) {
      console.log('⚠️ Search aborted: Rate limited');
      return;
    }
    
    // If this is an auto-search (not manual) and the params are the same as last search
    // or it's been less than 2 seconds since last manual search, skip it
    if (!manual && 
        (searchParams === lastSearchParamsRef.current || 
         Date.now() - lastManualSearchRef.current < 2000)) {
      console.log('🔄 Skipping duplicate auto-search');
      return;
    }
    
    // For manual searches, update the timestamp
    if (manual) {
      lastManualSearchRef.current = Date.now();
    }
    
    // Reset recipes state for new searches
    if (page === 1) {
      setRecipes([]);
      setFilteredRecipes([]);
    }
    
    // Always cancel any pending search request
    if (searchRequestRef.current) {
      clearTimeout(searchRequestRef.current);
    }
    
    // Check if we have valid ingredients
    if (!ingredients.trim()) {
      console.log('❌ Search aborted: Empty ingredients');
      return;
    }
    
    // Set up a new search with debounce
    searchRequestRef.current = setTimeout(async () => {
      console.log(`🔍 ${manual ? 'Manual' : 'Auto'} search initiated with:`, ingredients);
      
      // Update the last search params
      lastSearchParamsRef.current = searchParams;
      
      // Clear the request ref as we're now executing
      searchRequestRef.current = null;
      
      // Use cached results if available
      const cacheKey = `${ingredients}-${JSON.stringify(dietaryFilters)}-${cookingTimeFilter}-${cuisineFilter}-${mealTypeFilter}`;
      const cachedData = searchCache[cacheKey];
      
      // If we have cached data less than 5 minutes old, use it
      if (cachedData && (Date.now() - cachedData.timestamp < 5 * 60 * 1000)) {
        console.log('📦 Using cached search results:', cachedData.recipes.length, 'recipes');
        setRecipes(cachedData.recipes);
        setPagination(cachedData.pagination);
        setTotalResults(cachedData.totalResults);
        return;
      }
      
      setLoading(true);
      setErrorMessage('');
      
      try {
        const ingredientsArray = processIngredients(ingredients);
        
        if (ingredientsArray.length === 0) {
          setErrorMessage('Please enter at least one ingredient');
          setLoading(false);
          return;
        }
        
        // Add active dietary filters to the request
        const activeFilters = Object.entries(dietaryFilters)
          .filter(([_, isActive]) => isActive)
          .map(([filter]) => filter);
        
        // Add additional filters if they're not set to 'any'
        const additionalFilters: Record<string, string> = {};
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
        
        // Create a clean request payload - always use exactly this format for consistency
        const requestPayload = {
          ingredients: ingredientsArray,
          dietary: activeFilters,
          matchAll: useStrictMatching,
          page: page,
          page_size: pageSize,
          max_results: 100,
          ...additionalFilters
        };

        console.log('🔍 Sending search payload:', requestPayload);
        
        // Make the API request
        const data = await fetchRecipesFromAPI(requestPayload);
        
        let recipesData = data.recipes || [];
        
        // Store pagination information if it's available
        if (data.pagination) {
          setPagination(data.pagination);
          // Limit the total displayed for better UX if it's very large
          const rawTotal = data.pagination.total || recipesData.length;
          setTotalResults(Math.min(rawTotal, maxResultsToShow));
          
          // If the total is very high, update maxResultsToShow to match what the API is actually returning
          if (rawTotal > maxResultsToShow) {
            setMaxResultsToShow(Math.min(rawTotal, 100)); // Cap at 100 for performance
          }
        } else {
          setPagination(null);
          setTotalResults(recipesData.length);
        }
        
        // Sort recipes by relevance and ensure they have IDs
        recipesData = rankRecipesByIngredientMatches(recipesData, ingredientsArray);
        recipesData = ensureRecipesHaveIds(recipesData);
        
        // Store the results in cache
        setSearchCache(prevCache => ({
          ...prevCache,
          [cacheKey]: {
            recipes: recipesData,
            pagination: data.pagination || null,
            totalResults: recipesData.length,
            timestamp: Date.now()
          }
        }));
        
        setRecipes(recipesData);
        
        // Reset search attempts when a successful search happens
        setSearchAttempts(0);
        
        // Show a message if no recipes found
        if (recipesData.length === 0) {
          const filterMessage = activeFilters.length > 0 
            ? ` matching your dietary preferences (${activeFilters.join(', ')})`
            : '';
          const matchStrategy = ingredientsArray.length >= 3 ? 'all' : 'any';
          const errorMsg = `No recipes found with ${matchStrategy} of these ingredients${filterMessage}. Try different ingredients or filters.`;
          setErrorMessage(errorMsg);
        }
      } catch (error: any) {
        console.error('❌ Error fetching recipes:', error);
        setRecipes([]);
        
        // Increment search attempts
        setSearchAttempts(prev => prev + 1);
        
        // Check if rate limited (HTTP 429)
        if (error.response && error.response.status === 429) {
          setIsRateLimited(true);
          // Clear any existing timer
          if (rateLimitTimerRef.current) {
            clearTimeout(rateLimitTimerRef.current);
          }
          
          // Aggressive backoff for rate limiting - minimum 10 seconds, maximum 2 minutes
          const backoffTime = Math.min(120000, 10000 * Math.pow(1.5, searchAttempts));
          
          const errorMsg = `Server error: Too many requests. Please try again in ${Math.round(backoffTime/1000)} seconds.`;
          setErrorMessage(errorMsg);
          
          // Auto-clear rate limit after backoff time
          rateLimitTimerRef.current = setTimeout(() => {
            setIsRateLimited(false);
          }, backoffTime);
        } else if (error.response && error.response.status === 422) {
          // Handle validation errors
          const errorMsg = 'Invalid search request. Please check your search parameters.';
          setErrorMessage(errorMsg);
          console.error('Validation error details:', error.response.data);
        } else {
          // Other error
          setErrorMessage(`Error searching for recipes: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    }, manual ? 0 : 750); // No delay for manual searches, longer delay for auto-searches
  }, [currentPage, ingredients, dietaryFilters, cookingTimeFilter, cuisineFilter, mealTypeFilter, 
      isRateLimited, searchCache, maxResultsToShow, pageSize, searchAttempts]);
  
  // Initialize auto-search after mount
  useEffect(() => {
    if (!autoSearchEnabledRef.current) {
      console.log('Component mounted - auto-search enabled');
      autoSearchEnabledRef.current = true;
      // Don't perform search on initial mount
      return;
    }
    
    // Only attempt search if there's at least one character in the ingredients
    if (ingredients.trim().length > 0) {
      performSearch(1, false);
    }
    
    // Cleanup function to cancel pending searches when dependencies change
    return () => {
      if (searchRequestRef.current) {
        clearTimeout(searchRequestRef.current);
      }
    };
  }, [ingredients, dietaryFilters, cookingTimeFilter, cuisineFilter, mealTypeFilter, performSearch]);
  
  // Handle page changes for pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.pages)) return;
    
    setCurrentPage(newPage);
    performSearch(newPage, true);
  };
  
  // Generate page numbers for pagination UI
  const getPageNumbers = (): (number | string)[] => {
    if (!pagination) return [];
    
    // If pagination response includes page_numbers, use those
    if (pagination.page_numbers && pagination.page_numbers.length > 0) {
      return pagination.page_numbers;
    }
    
    // Otherwise generate page numbers to display (show up to 5 pages)
    const { page, pages } = pagination;
    const pageNumbers: (number | string)[] = [];
    
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
  
  return {
    // State
    recipes,
    ingredients,
    setIngredients,
    dietaryFilters,
    toggleDietaryFilter,
    isLoading: loading,
    isRateLimited,
    isError: !!errorMessage,
    totalResults,
    currentPage,
    totalPages: pagination?.pages || 1,
    // Actions
    setPage: handlePageChange,
    performSearch,
    resetFilters,
  };
}; 