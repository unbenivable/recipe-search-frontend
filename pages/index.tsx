import React, { useState, useEffect } from 'react';
import { useSearch } from '@/hooks/useSearch';
import { detectIngredientsAPI } from '@/utils/api';
import { Recipe } from '@/types';
import axios from 'axios';

// Import components
import ErrorMessage from '@/components/ErrorMessage';
import SearchModeSelector from '@/components/SearchModeSelector';
import SearchBar from '@/components/SearchBar';
import ImageUploader from '@/components/ImageUploader';
import RecipeList from '@/components/RecipeList';
import RecipeDetailView from '@/components/RecipeDetailView';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';

// Add global styles for smooth transitions
const globalStyles = `
  * {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease, transform 0.3s ease;
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease forwards;
  }
  
  .slide-up {
    animation: slideUp 0.4s ease forwards;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  .recipe-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .recipe-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  }
`;

const Home: React.FC = () => {
  // Mobile detection state
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [searchMode, setSearchMode] = useState<string>('recipe'); // 'recipe' or 'detect'
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isDetectingIngredients, setIsDetectingIngredients] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  // Get search functionality from custom hook
  const {
    recipes,
    ingredients,
    setIngredients,
    dietaryFilters,
    toggleDietaryFilter,
    isLoading,
    isRateLimited,
    isError,
    totalResults,
    currentPage,
    totalPages,
    pageNumbers,
    setPage,
    performSearch,
    resetFilters,
  } = useSearch();
  
  // Wrapper function for search
  const handleSearch = () => {
    performSearch(1, true);
  };
  
  // Wrapper function for clearing filters
  const handleClear = () => {
    resetFilters();
    setIngredients('');
  };
  
  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close filters dropdown when clicking outside
      if (!(event.target as HTMLElement).closest('[data-filter-container]')) {
        setShowFilters(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle image detection
  const handleDetectIngredients = async () => {
    if (!selectedImage) return;

    setIsDetectingIngredients(true);
    setErrorMessage('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const detectedIngredients = await detectIngredientsAPI(formData);
      
      // Set the detected ingredients
      if (detectedIngredients && detectedIngredients.length > 0) {
        setIngredients(detectedIngredients.join(', '));
        // Switch back to recipe search with the detected ingredients
        setSearchMode('recipe');
        // Trigger search with new ingredients
        handleSearch();
      } else {
        setErrorMessage('No ingredients detected in the image. Please try a different image.');
      }
    } catch (error: unknown) {
      console.error('Error detecting ingredients:', error);
      
      let errorMsg = 'Error detecting ingredients. Please try again.';
      
      // Handle our RecipeAPIError specifically
      if (error && typeof error === 'object' && 'name' in error && error.name === 'RecipeAPIError') {
        // We know this is our custom error type
        const apiError = error as { message: string };
        errorMsg = apiError.message;
      } else if (error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response && 
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        // Legacy handling for axios errors
        errorMsg = String(error.response.data.error);
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsDetectingIngredients(false);
      // Clear the selected image
      setSelectedImage(null);
      setImagePreview('');
    }
  };

  // Add a handler to prepare the recipe with directions if they don't exist
  const handleViewRecipe = (recipe: Recipe) => {
    // Create a copy of the recipe
    const recipeWithDirections = { ...recipe };
    
    // Add sample directions if none exist
    if (!recipeWithDirections.directions) {
      recipeWithDirections.directions = [
        `Prepare all ingredients for ${recipe.title}.`,
        "Preheat your cooking appliance to the appropriate temperature.",
        "Combine ingredients according to your preference.",
        "Cook until done to your liking.",
        "Serve and enjoy!"
      ];
    }
    
    setSelectedRecipe(recipeWithDirections);
  };

  return (
    <div style={{ 
      background: "#121212", 
      color: "#ffffff", 
      padding: "2rem", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      maxWidth: "1200px",
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Add global styles */}
      <style jsx global>{globalStyles}</style>
      
      {/* Error message component */}
      <ErrorMessage 
        message={errorMessage || (isError ? 'Error searching for recipes. Please try again.' : '')} 
        onClose={() => setErrorMessage('')} 
      />
      
      <h1 style={{ 
        textAlign: "center", 
        fontSize: "36px", 
        fontWeight: "600", 
        marginBottom: "0.5rem", 
        color: "#ffffff",
        animation: "fadeIn 0.8s ease"
      }}>Recipe Finder</h1>
      
      <h2 style={{ 
        textAlign: "center", 
        fontSize: "18px", 
        fontWeight: "500", 
        marginBottom: "2rem", 
        color: "#4285f4",
        fontStyle: "italic",
        animation: "fadeIn 1s ease"
      }}>ingreddit.com</h2>
      
      {/* Search mode selector (recipes vs. image detection) */}
      <div className="fade-in" style={{ animationDelay: "0.2s" }}>
        <SearchModeSelector 
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          isMobile={isMobile}
        />
      </div>

      {/* Search UI based on selected mode */}
      <div className="fade-in" style={{ animationDelay: "0.4s" }}>
        {searchMode === 'detect' ? (
          <ImageUploader 
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            handleDetectIngredients={handleDetectIngredients}
            isDetectingIngredients={isDetectingIngredients}
          />
        ) : (
          <>
            <p style={{ 
              textAlign: "center", 
              fontSize: "16px", 
              color: "#a0a0a0",
              marginBottom: "1.5rem" 
            }}>
              Enter ingredients separated by commas or spaces (e.g. chicken rice garlic)
            </p>
            
            <SearchBar 
              ingredients={ingredients}
              setIngredients={setIngredients}
              dietaryFilters={dietaryFilters}
              toggleDietaryFilter={toggleDietaryFilter}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              handleClear={handleClear}
              handleSearch={handleSearch}
              isLoading={isLoading}
              isRateLimited={isRateLimited}
            />
          </>
        )}
      </div>

      {/* Results section */}
      <div className="fade-in" style={{ flex: 1, animationDelay: "0.6s" }}>
        <RecipeList 
          recipes={recipes}
          isLoading={isLoading}
          totalResults={totalResults}
          isMobile={isMobile}
          onRecipeClick={handleViewRecipe}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            pageNumbers={pageNumbers}
            setPage={setPage}
          />
        )}
      </div>
      
      {/* Recipe Detail View */}
      {selectedRecipe && (
        <RecipeDetailView 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}
      
      {/* Footer */}
      <div className="fade-in" style={{ animationDelay: "0.8s" }}>
        <Footer />
      </div>
    </div>
  );
};

export default Home; 