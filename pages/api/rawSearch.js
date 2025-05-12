import axios from 'axios';

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Collect the raw request body
    const chunks = [];
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', resolve);
      req.on('error', reject);
    });
    
    const rawBody = Buffer.concat(chunks).toString('utf8');
    console.log('Raw request body:', rawBody);
    
    // Parse the raw body
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing raw body:', parseError);
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
    
    // Forward the request using the raw body
    const response = await axios.post(
      'https://web-production-9df5.up.railway.app/search',
      parsedBody,
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