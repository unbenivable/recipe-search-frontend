import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Recipe } from '@/types';

interface SavedRecipesState {
  savedRecipes: Recipe[];
  savedTitles: Set<string>;
  loading: boolean;
  saveRecipe: (recipe: Recipe) => Promise<void>;
  unsaveRecipe: (title: string) => Promise<void>;
  isSaved: (recipe: Recipe) => boolean;
}

export const useSavedRecipes = (user: User | null): SavedRecipesState => {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [savedTitles, setSavedTitles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const loadSavedRecipes = useCallback(async () => {
    if (!user) {
      setSavedRecipes([]);
      setSavedTitles(new Set());
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('saved_recipes')
      .select('title, recipe_data, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const recipes = data.map(row => ({
        ...(row.recipe_data as Recipe),
        title: row.title
      }));
      setSavedRecipes(recipes);
      setSavedTitles(new Set(data.map(row => row.title)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadSavedRecipes();
  }, [loadSavedRecipes]);

  const saveRecipe = useCallback(async (recipe: Recipe) => {
    if (!user) return;

    const { error } = await supabase
      .from('saved_recipes')
      .upsert(
        {
          user_id: user.id,
          title: recipe.title,
          recipe_data: recipe
        },
        { onConflict: 'user_id,title' }
      );

    if (!error) {
      setSavedRecipes(prev => [recipe, ...prev.filter(r => r.title !== recipe.title)]);
      setSavedTitles(prev => new Set(prev).add(recipe.title));
    }
  }, [user]);

  const unsaveRecipe = useCallback(async (title: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('saved_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('title', title);

    if (!error) {
      setSavedRecipes(prev => prev.filter(r => r.title !== title));
      setSavedTitles(prev => {
        const next = new Set(prev);
        next.delete(title);
        return next;
      });
    }
  }, [user]);

  const isSaved = useCallback((recipe: Recipe) => {
    return savedTitles.has(recipe.title);
  }, [savedTitles]);

  return { savedRecipes, savedTitles, loading, saveRecipe, unsaveRecipe, isSaved };
};
