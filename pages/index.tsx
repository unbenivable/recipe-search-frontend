import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSearch } from '@/hooks/useSearch';
import { detectIngredientsAPI } from '@/utils/api';
import { Recipe } from '@/types';

import ErrorMessage from '@/components/ErrorMessage';
import SearchModeSelector from '@/components/SearchModeSelector';
import SearchBar from '@/components/SearchBar';
import ImageUploader from '@/components/ImageUploader';
import RecipeList from '@/components/RecipeList';
import RecipeDetailView from '@/components/RecipeDetailView';
import Pagination from '@/components/Pagination';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  const [searchMode, setSearchMode] = useState<string>('recipe');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isDetectingIngredients, setIsDetectingIngredients] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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

  const handleSearch = () => {
    performSearch(1, true);
  };

  const handleClear = () => {
    resetFilters();
    setIngredients('');
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-filter-container]')) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDetectIngredients = async () => {
    if (!selectedImage) return;

    setIsDetectingIngredients(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const detectedIngredients = await detectIngredientsAPI(formData);

      if (detectedIngredients && detectedIngredients.length > 0) {
        const ingredientString = detectedIngredients.join(', ');
        setIngredients(ingredientString);
        setSearchMode('recipe');
        // Pass ingredients directly — don't rely on async state update
        performSearch(1, true, ingredientString);
        // Clear image on success
        setSelectedImage(null);
        setImagePreview('');
      } else {
        setErrorMessage('No ingredients detected in the image. Please try a different image.');
      }
    } catch (error: unknown) {
      let errorMsg = 'Error detecting ingredients. Please try again.';

      if (error && typeof error === 'object' && 'name' in error && error.name === 'RecipeAPIError') {
        const apiError = error as unknown as { message: string; details?: { code?: string } };
        // Use specific error messages from the API
        if (apiError.details && apiError.details.code === 'FILE_TOO_LARGE') {
          errorMsg = 'Image is too large. Please use an image under 4MB.';
        } else if (apiError.details && apiError.details.code === 'UNSUPPORTED_FORMAT') {
          errorMsg = 'Unsupported image format. Please use JPEG, PNG, or WebP.';
        } else if (apiError.details && apiError.details.code === 'TIMEOUT') {
          errorMsg = 'Image analysis timed out. Please try a smaller or simpler image.';
        } else {
          errorMsg = apiError.message;
        }
      } else if (error && typeof error === 'object' && 'response' in error &&
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data) {
        errorMsg = String((error.response as { data: { error: string } }).data.error);
      }

      setErrorMessage(errorMsg);
      // Don't clear image on error — let user retry
    } finally {
      setIsDetectingIngredients(false);
    }
  };

  const handleViewRecipe = (recipe: Recipe) => {
    const recipeWithDirections = { ...recipe };

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
    <>
      <Head>
        <title>Ingreddit — Find recipes with what you have</title>
        <meta name="description" content="Search recipes by ingredients you already have. Powered by AI ingredient detection." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="app-container">
        <ErrorMessage
          message={errorMessage || (isError ? 'Error searching for recipes. Please try again.' : '')}
          onClose={() => setErrorMessage('')}
        />

        {/* Hero */}
        <header className="hero fade-in">
          <h1 className="hero-title">Ingreddit</h1>
          <p className="hero-tagline">Find recipes with what you have</p>
        </header>

        {/* Mode Selector */}
        <div className="fade-in">
          <SearchModeSelector
            searchMode={searchMode}
            setSearchMode={setSearchMode}
          />
        </div>

        {/* Search / Upload */}
        <div className="fade-in">
          {searchMode === 'detect' ? (
            <ImageUploader
              selectedImage={selectedImage}
              setSelectedImage={setSelectedImage}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              handleDetectIngredients={handleDetectIngredients}
              isDetectingIngredients={isDetectingIngredients}
              onError={setErrorMessage}
            />
          ) : (
            <>
              <p className="search-hint">
                Enter ingredients separated by commas (e.g. chicken, rice, garlic)
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

        {/* Results */}
        <div className="flex-1 fade-in">
          <RecipeList
            recipes={recipes}
            isLoading={isLoading}
            totalResults={totalResults}
            onRecipeClick={handleViewRecipe}
          />

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              setPage={setPage}
            />
          )}
        </div>

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
          />
        )}

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default Home;
