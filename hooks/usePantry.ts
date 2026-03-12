import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface PantryState {
  pantryItems: string[];
  loading: boolean;
  addToPantry: (ingredient: string) => Promise<void>;
  addMultipleToPantry: (ingredients: string[]) => Promise<void>;
  removeFromPantry: (ingredient: string) => Promise<void>;
  clearPantry: () => Promise<void>;
}

export const usePantry = (user: User | null): PantryState => {
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPantry = useCallback(async () => {
    if (!user) {
      setPantryItems([]);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('pantry_items')
      .select('ingredient')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setPantryItems(data.map(item => item.ingredient));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadPantry();
  }, [loadPantry]);

  const addToPantry = useCallback(async (ingredient: string) => {
    if (!user) return;
    const cleaned = ingredient.trim().toLowerCase();
    if (!cleaned || pantryItems.includes(cleaned)) return;

    const { error } = await supabase
      .from('pantry_items')
      .upsert(
        { user_id: user.id, ingredient: cleaned },
        { onConflict: 'user_id,ingredient' }
      );

    if (!error) {
      setPantryItems(prev => [...prev, cleaned]);
    }
  }, [user, pantryItems]);

  const addMultipleToPantry = useCallback(async (ingredients: string[]) => {
    if (!user) return;
    const newItems = ingredients
      .map(i => i.trim().toLowerCase())
      .filter(i => i && !pantryItems.includes(i));

    if (newItems.length === 0) return;

    const rows = newItems.map(ingredient => ({
      user_id: user.id,
      ingredient
    }));

    const { error } = await supabase
      .from('pantry_items')
      .upsert(rows, { onConflict: 'user_id,ingredient' });

    if (!error) {
      setPantryItems(prev => [...prev, ...newItems]);
    }
  }, [user, pantryItems]);

  const removeFromPantry = useCallback(async (ingredient: string) => {
    if (!user) return;
    const cleaned = ingredient.trim().toLowerCase();

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('user_id', user.id)
      .eq('ingredient', cleaned);

    if (!error) {
      setPantryItems(prev => prev.filter(i => i !== cleaned));
    }
  }, [user]);

  const clearPantry = useCallback(async () => {
    if (!user) return;

    const { error } = await supabase
      .from('pantry_items')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setPantryItems([]);
    }
  }, [user]);

  return { pantryItems, loading, addToPantry, addMultipleToPantry, removeFromPantry, clearPantry };
};
