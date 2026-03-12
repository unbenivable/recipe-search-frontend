import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useSavedRecipes } from '@/hooks/useSavedRecipes';
import { Recipe } from '@/types';
import RecipeDetailView from '@/components/RecipeDetailView';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import Footer from '@/components/Footer';

export default function SavedRecipesPage() {
  const { user, loading: authLoading } = useAuth();
  const { savedRecipes, savedTitles, loading, saveRecipe, unsaveRecipe, isSaved } = useSavedRecipes(user);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const handleToggleSave = (recipe: Recipe) => {
    if (isSaved(recipe)) {
      unsaveRecipe(recipe.title);
    } else {
      saveRecipe(recipe);
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

  if (authLoading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Saved Recipes | Ingreddit</title>
        <meta name="description" content="Your saved recipes on Ingreddit" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="app-container">
        <div className="saved-header">
          <Link href="/" className="back-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </Link>
          <ThemeSwitcher />
        </div>

        <header className="hero fade-in">
          <h1 className="hero-title" style={{ fontSize: '1.75rem' }}>Saved Recipes</h1>
          {user && (
            <p className="hero-tagline">{savedRecipes.length} {savedRecipes.length === 1 ? 'recipe' : 'recipes'} saved</p>
          )}
        </header>

        {!user ? (
          <div className="saved-empty fade-in">
            <p>Sign in to save and view your favorite recipes.</p>
            <Link href="/" className="saved-cta">
              Go to Search
            </Link>
          </div>
        ) : loading ? (
          <div className="saved-loading">
            <div className="loading-spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : savedRecipes.length === 0 ? (
          <div className="saved-empty fade-in">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p>No saved recipes yet.</p>
            <p className="saved-empty-hint">Tap the heart icon on any recipe to save it here.</p>
            <Link href="/" className="saved-cta">
              Find Recipes
            </Link>
          </div>
        ) : (
          <div className="fade-in">
            <div className="recipe-grid">
              {savedRecipes.map((recipe, index) => {
                const saved = savedTitles.has(recipe.title);
                return (
                  <div
                    key={recipe.title + index}
                    className="recipe-card"
                    style={{ animationDelay: `${index * 0.04}s` }}
                    onClick={() => handleViewRecipe(recipe)}
                  >
                    <button
                      className={`recipe-heart ${saved ? 'saved' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(recipe);
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

                    <h3 className="recipe-card-title">{recipe.title}</h3>

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
        )}

        {selectedRecipe && (
          <RecipeDetailView
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            isSaved={isSaved(selectedRecipe)}
            onToggleSave={handleToggleSave}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
