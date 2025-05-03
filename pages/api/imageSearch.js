import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Parse service account JSON from env
    const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    if (!credentialsJson) {
      return res.status(500).json({ error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON is not configured' });
    }
    const credentials = JSON.parse(credentialsJson);
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (!projectId) {
      return res.status(500).json({ error: 'GOOGLE_CLOUD_PROJECT_ID is not configured' });
    }

    // Authenticate and get access token
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Call Vertex AI
    const response = await axios.post(
      `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/us-central1/publishers/google/models/imagegeneration@002:predict`,
      {
        instances: [
          {
            prompt: `High quality food photo of ${query}`,
            sampleCount: 1
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken.token || accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const predictions = response.data.predictions || [];
    const images = predictions.map((prediction, index) => ({
      url: prediction.image,
      alt: `${query} - result ${index + 1}`
    }));
    
    return res.status(200).json({ images });
  } catch (error) {
    console.error('Error searching images:', error);
    return res.status(500).json({ 
      error: 'Failed to search images',
      details: error.response ? error.response.data : error.message 
    });
  }
} 