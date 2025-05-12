import axios, { AxiosRequestConfig } from 'axios';
import { Recipe } from '@/types';

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

    // Use the local API proxy endpoint
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
  } catch (error) {
    console.error('Error in fetchRecipesFromAPI:', error);
    // Provide more detailed error information
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Function to search images
export const searchImagesAPI = async (query: string): Promise<{ images: string[] }> => {
  const response = await axios.post('/api/imageSearch', { query });
  return response.data;
};

// Function to detect ingredients from image
export const detectIngredientsAPI = async (formData: FormData): Promise<string[]> => {
  try {
    console.log('Sending image for ingredient detection');
    
    const response = await axios.post<{ ingredients: string[] }>(
      '/api/detectIngredients', 
      formData, 
      {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      }
    );
    
    if (response.data && response.data.ingredients) {
      console.log('Detected ingredients:', response.data.ingredients);
      return response.data.ingredients;
    } else {
      console.error('No ingredients detected or unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error in detectIngredientsAPI:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}; 