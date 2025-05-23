import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the incoming request body for debugging
    console.log('Incoming request body:', req.body);
    
    // Check if the body has the strange format from the error message
    let requestBody = req.body;
    
    // If the req.body has the JSON string as a key, extract the actual content
    const bodyKeys = Object.keys(req.body);
    if (bodyKeys.length === 1 && bodyKeys[0].startsWith('{') && bodyKeys[0].includes('ingredients')) {
      try {
        // Parse the key as JSON to extract the real request body
        requestBody = JSON.parse(bodyKeys[0]);
        console.log('Extracted body from key:', requestBody);
      } catch (parseError) {
        console.error('Error parsing body key as JSON:', parseError);
      }
    }

    // Make the request with the fixed body
    const response = await axios.post(
      'https://web-production-9df5.up.railway.app/search',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Return the response data
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error proxying search request:', error);
    
    // For debugging: log the exact error details
    if (error.response) {
      console.error('Backend response:', error.response.status, error.response.data);
    }
    
    // Forward the error response with appropriate status
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    
    return res.status(500).json({ 
      error: 'Failed to fetch recipes', 
      details: error.message
    });
  }
} 