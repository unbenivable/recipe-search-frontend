import axios from 'axios';

// Enable body parsing for this route
export const config = {
  api: {
    bodyParser: true,
  },
};

// Actual backend URL - hardcoded for reliability 
const BACKEND_URL = 'https://web-production-9df5.up.railway.app/search';

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute
const requestCounts = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting - using IP address as identifier
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    
    // Clean up old rate limit entries
    for (const [ip, data] of requestCounts.entries()) {
      if (now - data.timestamp > RATE_LIMIT_WINDOW) {
        requestCounts.delete(ip);
      }
    }
    
    // Check rate limit
    if (!requestCounts.has(clientIp)) {
      requestCounts.set(clientIp, { count: 1, timestamp: now });
    } else {
      const data = requestCounts.get(clientIp);
      
      // If within rate limit window and over limit
      if (now - data.timestamp < RATE_LIMIT_WINDOW && data.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ 
          error: 'Too many requests', 
          detail: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((data.timestamp + RATE_LIMIT_WINDOW - now) / 1000)
        });
      }
      
      // Update counter
      data.count += 1;
      requestCounts.set(clientIp, data);
    }
    
    // Log and validate the incoming request
    console.log('Received request body:', req.body);
    
    // Validate required request fields
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body',
        detail: 'Request body must be a valid JSON object'
      });
    }
    
    // Ensure ingredients array exists and is properly formatted
    if (!Array.isArray(req.body.ingredients) || req.body.ingredients.length === 0) {
      return res.status(422).json({
        error: 'Unprocessable Entity',
        detail: 'Request must include a non-empty ingredients array'
      });
    }
    
    // Ensure other required fields have defaults
    const normalizedBody = {
      ingredients: req.body.ingredients,
      dietary: Array.isArray(req.body.dietary) ? req.body.dietary : [],
      matchAll: Boolean(req.body.matchAll),
      page: Number(req.body.page) || 1,
      page_size: Number(req.body.page_size) || 10,
      max_results: Number(req.body.max_results) || 100
    };
    
    // Add any additional filters if they exist
    if (req.body.cookingTime) normalizedBody.cookingTime = req.body.cookingTime;
    if (req.body.cuisine) normalizedBody.cuisine = req.body.cuisine;
    if (req.body.mealType) normalizedBody.mealType = req.body.mealType;
    
    // Generate cache key based on normalized request body
    const cacheKey = JSON.stringify(normalizedBody);
    
    // Check cache first
    if (cache.has(cacheKey)) {
      const cachedData = cache.get(cacheKey);
      if (now - cachedData.timestamp < CACHE_TTL) {
        console.log('Using cached search results');
        return res.status(200).json(cachedData.data);
      } else {
        // Expired cache entry
        cache.delete(cacheKey);
      }
    }
    
    // Forward request to the backend
    console.log('Forwarding request to backend:', normalizedBody);
    const response = await axios.post(
      BACKEND_URL,
      normalizedBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );
    
    // Cache successful responses
    cache.set(cacheKey, {
      data: response.data,
      timestamp: now
    });
    
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error proxying search request:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Backend response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received from backend');
    } else {
      console.error('Request setup error:', error.message);
    }
    
    // Handle different types of errors appropriately
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      return res.status(error.response.status).json({
        error: 'Backend error',
        detail: error.response.data?.detail || 'An error occurred with the backend service',
        status: error.response.status
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(504).json({
        error: 'Gateway timeout',
        detail: 'The backend service did not respond in time'
      });
    } else {
      // Something happened in setting up the request
      return res.status(500).json({
        error: 'Internal server error',
        detail: error.message
      });
    }
  }
} 