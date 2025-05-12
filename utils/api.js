import axios from 'axios';

// Helper function to create axios config that handles circular references
export const createCircularJsonHandler = () => {
  return {
    transformRequest: [(data, headers) => {
      // Custom JSON.stringify with a replacer function to handle circular references
      const seen = new WeakSet();
      const replacer = (key, value) => {
        // Skip React-specific properties that might cause circular references
        if (key.startsWith('__react') || key === 'stateNode') {
          return undefined;
        }
        
        // Handle DOM nodes and React elements
        if (value instanceof Element || 
            value instanceof SVGElement || 
            (typeof value === 'object' && value !== null && value.$$typeof)) {
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
export const fetchRecipesFromAPI = async (requestPayload) => {
  try {
    // Validate and normalize the request payload
    const normalizedPayload = {
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
    const response = await axios.post(
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
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Function to search images
export const searchImagesAPI = async (query) => {
  const response = await axios.post('/api/imageSearch', { query });
  return response.data;
};

// Function to detect ingredients from image
export const detectIngredientsAPI = async (formData) => {
  try {
    console.log('Sending image for ingredient detection');
    
    const response = await axios.post('/api/detectIngredients', formData, {
      headers: { 
        'Content-Type': 'multipart/form-data' 
      }
    });
    
    if (response.data && response.data.ingredients) {
      console.log('Detected ingredients:', response.data.ingredients);
      return response.data.ingredients;
    } else {
      console.error('No ingredients detected or unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error in detectIngredientsAPI:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
}; 