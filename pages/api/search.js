import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the request to the Rails backend
    const response = await axios.post(
      'https://web-production-9df5.up.railway.app/search',
      req.body,
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