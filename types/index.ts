// Recipe related types
export interface Recipe {
  id?: string | number;
  title: string;
  ingredients: string[];
  directions?: string[];
  nutrition?: RecipeNutrition;
  matchScore?: number;
  matchPercentage?: number;
  cuisine?: string;
  cookingTime?: string | number;
  mealType?: string;
}

export interface RecipeNutrition {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber?: string;
  sugar?: string;
  [key: string]: string | undefined;
}

// Search related types
export interface DietaryFilters {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  lowCarb: boolean;
  [key: string]: boolean;
}

export interface SearchHookState {
  recipes: Recipe[];
  ingredients: string;
  setIngredients: (ingredients: string) => void;
  dietaryFilters: DietaryFilters;
  toggleDietaryFilter: (filter: string) => void;
  isLoading: boolean;
  isRateLimited: boolean;
  isError: boolean;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumbers: (number | string)[];
  setPage: (page: number) => void;
  performSearch: (page?: number, manual?: boolean) => void;
  resetFilters: () => void;
}

// Component Props types
export interface ErrorMessageProps {
  message: string;
  onClose: () => void;
}

export interface RecipeDetailViewProps {
  recipe: Recipe;
  onClose: () => void;
}

export interface ImageUploaderProps {
  selectedImage: File | null;
  setSelectedImage: (image: File | null) => void;
  imagePreview: string;
  setImagePreview: (preview: string) => void;
  handleDetectIngredients: () => void;
  isDetectingIngredients: boolean;
}

export interface SearchModeSelectorProps {
  searchMode: string;
  setSearchMode: (mode: string) => void;
  isMobile: boolean;
}

export interface RecipeListProps {
  recipes: Recipe[];
  isLoading: boolean;
  totalResults: number;
  isMobile: boolean;
  onRecipeClick: (recipe: Recipe) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageNumbers: (number | string)[];
  setPage: (page: number) => void;
}

export interface SearchBarProps {
  ingredients: string;
  setIngredients: (ingredients: string) => void;
  dietaryFilters: DietaryFilters;
  toggleDietaryFilter: (filter: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  handleClear: () => void;
  handleSearch: () => void;
  isLoading: boolean;
  isRateLimited: boolean;
}

export interface FilterMenuProps {
  dietaryFilters: DietaryFilters;
  toggleDietaryFilter: (filter: string) => void;
  handleClear: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
} 