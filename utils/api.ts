import axios, { AxiosRequestConfig } from 'axios';
import { Recipe } from '@/types';
import { RecipeAPIError, ErrorCodes } from './errors';

interface SearchResponse {
  recipes: Recipe[];
  pagination?: {
    page: number;
    pages: number;
    total?: number;
    page_numbers?: number[];
  };
}

interface SearchRequest {
  ingredients: string[];
  dietary?: string[];
  matchAll?: boolean;
  page?: number;
  page_size?: number;
  max_results?: number;
  cookingTime?: string;
  cuisine?: string;
  mealType?: string;
  [key: string]: any;
}

// Helper function to create axios config that handles circular references
export const createCircularJsonHandler = (): AxiosRequestConfig => {
  return {
    transformRequest: [(data: any, headers?: any) => {
      // Custom JSON.stringify with a replacer function to handle circular references
      const seen = new WeakSet();
      const replacer = (key: string, value: any) => {
        // Skip React-specific properties that might cause circular references
        if (key.startsWith('__react') || key === 'stateNode') {
          return undefined;
        }
        
        // Handle DOM nodes and React elements
        if (typeof window !== 'undefined' && (
          (typeof Element !== 'undefined' && value instanceof Element) || 
          (typeof SVGElement !== 'undefined' && value instanceof SVGElement) || 
          (typeof value === 'object' && value !== null && value.$$typeof)
        )) {
          return '[ReactElement]';
        }
        
        // Handle other circular references
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return undefined;
          }
          seen.add(value);
        }
        return value;
      };
      
      return JSON.stringify(data, replacer);
    }]
  };
};

/**
 * Fetches data with automatic retries for certain error types
 */
export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;

    // Only retry on network errors or 5xx (server) errors
    if (axios.isAxiosError(error) && 
       (error.code === 'ECONNABORTED' || 
        !error.response || 
        (error.response.status >= 500 && error.response.status < 600))) {
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry with exponential backoff
      return fetchWithRetry(fn, retries - 1, delay * 2);
    }
    
    throw error;
  }
}

// Function to fetch recipes from the API
export const fetchRecipesFromAPI = async (requestPayload: SearchRequest): Promise<SearchResponse> => {
  try {
    // Validate and normalize the request payload
    const normalizedPayload: SearchRequest = {
      ingredients: Array.isArray(requestPayload.ingredients) ? requestPayload.ingredients : [],
      dietary: Array.isArray(requestPayload.dietary) ? requestPayload.dietary : [],
      matchAll: Boolean(requestPayload.matchAll),
      page: Number(requestPayload.page) || 1,
      page_size: Number(requestPayload.page_size) || 10,
      max_results: Number(requestPayload.max_results) || 100
    };

    // Add any additional filters if they exist
    if (requestPayload.cookingTime) normalizedPayload.cookingTime = requestPayload.cookingTime;
    if (requestPayload.cuisine) normalizedPayload.cuisine = requestPayload.cuisine;
    if (requestPayload.mealType) normalizedPayload.mealType = requestPayload.mealType;

    // Log the exact payload for debugging
    console.log('Sending search request with payload:', normalizedPayload);

    // Use the fetchWithRetry utility for better resilience
    return await fetchWithRetry(async () => {
      const response = await axios.post<SearchResponse>(
        '/api/rawSearch',
        normalizedPayload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    });
  } catch (error) {
    console.error('Error in fetchRecipesFromAPI:', error);
    
    // Structured error handling with custom error class
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        throw new RecipeAPIError(
          ErrorCodes.NETWORK_ERROR, 
          'Network error - please check your connection and try again',
          error
        );
      }
      
      // Handle different HTTP status codes
      switch (error.response?.status) {
        case 429:
          throw new RecipeAPIError(
            ErrorCodes.RATE_LIMITED, 
            'You have made too many requests. Please try again later.',
            error.response.data
          );
        case 422:
          throw new RecipeAPIError(
            ErrorCodes.VALIDATION_ERROR, 
            'Invalid search parameters. Please check your search terms.',
            error.response.data
          );
        case 401:
          throw new RecipeAPIError(
            ErrorCodes.UNAUTHORIZED, 
            'You are not authorized to access this resource.',
            error.response.data
          );
        default:
          throw new RecipeAPIError(
            ErrorCodes.API_ERROR, 
            `API Error (${error.response?.status}): ${error.message}`,
            error.response?.data
          );
      }
    }
    
    // For non-Axios errors
    throw new RecipeAPIError(
      ErrorCodes.UNKNOWN, 
      'An unexpected error occurred while searching for recipes',
      error
    );
  }
};

// Function to search images
export const searchImagesAPI = async (query: string): Promise<{ images: string[] }> => {
  try {
    const response = await fetchWithRetry(() => 
      axios.post('/api/imageSearch', { query })
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new RecipeAPIError(
        ErrorCodes.API_ERROR,
        'Error searching for images: ' + (error.response?.data?.message || error.message),
        error
      );
    }
    throw new RecipeAPIError(ErrorCodes.UNKNOWN, 'Error searching for images', error);
  }
};

// Function to detect ingredients from image
export const detectIngredientsAPI = async (formData: FormData): Promise<string[]> => {
  try {
    console.log('Sending image for ingredient detection');
    
    const response = await fetchWithRetry(() => 
      axios.post<{ ingredients: string[] }>(
        '/api/detectIngredients', 
        formData, 
        {
          headers: { 
            'Content-Type': 'multipart/form-data' 
          }
        }
      )
    );
    
    if (response.data && response.data.ingredients) {
      console.log('Detected ingredients:', response.data.ingredients);
      return response.data.ingredients;
    } else {
      console.error('No ingredients detected or unexpected response format:', response.data);
      throw new RecipeAPIError(
        ErrorCodes.NOT_FOUND,
        'No ingredients could be detected in the image',
        response.data
      );
    }
  } catch (error) {
    console.error('Error in detectIngredientsAPI:', error);
    if (axios.isAxiosError(error)) {
      throw new RecipeAPIError(
        ErrorCodes.API_ERROR,
        'Error detecting ingredients: ' + (error.response?.data?.message || error.message),
        error
      );
    }
    throw new RecipeAPIError(ErrorCodes.UNKNOWN, 'Error detecting ingredients', error);
  }
}; 