import { GoogleAuth } from 'google-auth-library';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Generic food categories or terms to filter out
const genericFoodTerms = [
  'food', 'ingredient', 'vegetable', 'fruit', 'meat', 'dairy', 'grain', 'herb', 'spice',
  'dish', 'meal', 'cuisine', 'recipe', 'breakfast', 'lunch', 'dinner', 'snack',
  'seafood', 'produce', 'sauce', 'syrup', 'dessert', 'baked good', 'appetizer',
  'side dish', 'beverage', 'ice cream', 'seed', 'nut', 'object'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the uploaded file
    const form = new IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Error parsing form data' });
      }
      const file = files.image;
      if (!file) {
        return res.status(400).json({ error: 'No image uploaded' });
      }
      // Support both array and object for files.image
      const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
      if (!filePath) {
        return res.status(400).json({ error: 'No file path found for uploaded image' });
      }
      const imageBuffer = fs.readFileSync(filePath);
      const imageBase64 = imageBuffer.toString('base64');

      // Authenticate with Google
      const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
      if (!credentialsJson) {
        return res.status(500).json({ error: 'GOOGLE_APPLICATION_CREDENTIALS_JSON is not configured' });
      }
      const credentials = JSON.parse(credentialsJson);
      const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
      if (!projectId) {
        return res.status(500).json({ error: 'GOOGLE_CLOUD_PROJECT_ID is not configured' });
      }
      const auth = new GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
      });
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();

      // Call Google Vision API for label detection
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken.token || accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [
              {
                image: { content: imageBase64 },
                features: [
                  { type: 'LABEL_DETECTION', maxResults: 50 } // Get more labels to find varied ingredients
                ]
              }
            ]
          })
        }
      );

      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        return res.status(500).json({ error: 'Vision API did not return JSON', details: text });
      }
      const data = await response.json();
      
      // Get all labels with their confidence scores
      const allLabelsWithScores = data.responses?.[0]?.labelAnnotations || [];
      const allLabels = allLabelsWithScores
        .filter(label => label.score >= 0.7) // Lower threshold to catch more ingredients
        .map(label => ({ 
          name: label.description.toLowerCase(),
          score: label.score
        }));
      
      console.log('Detected labels:', allLabels);
      
      // Function to check if an ingredient is a variant of another
      const isVariantOf = (ingredient, otherIngredient) => {
        // Clean and normalize both strings
        const cleanIngredient = ingredient.trim().toLowerCase();
        const cleanOther = otherIngredient.trim().toLowerCase();
        
        // Check for exact inclusion
        if (cleanIngredient.includes(cleanOther) || cleanOther.includes(cleanIngredient)) {
          return true;
        }
        
        // Split multi-word ingredients
        const words1 = cleanIngredient.split(/\s+/);
        const words2 = cleanOther.split(/\s+/);
        
        // Check if the main word (usually the last word) is the same
        if (words1.length > 0 && words2.length > 0 && 
            words1[words1.length - 1] === words2[words2.length - 1]) {
          return true;
        }
        
        return false;
      };
      
      // Process and filter labels to find food ingredients
      const processedLabels = allLabels
        .filter(label => {
          // Filter out generic terms
          if (genericFoodTerms.some(term => 
              label.name === term || 
              label.name.includes(term) || 
              term.includes(label.name))) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.score - a.score); // Sort by confidence score
      
      // Extract unique ingredients while avoiding duplicates/variants
      let uniqueIngredients = [];
      processedLabels.forEach(label => {
        // Check if this is a real food ingredient (basic check)
        const isLikelyFood = 
          !label.name.includes("dish") && 
          !label.name.includes("cuisine") && 
          !label.name.includes("product") && 
          !label.name.includes("setting");
        
        if (isLikelyFood) {
          // Check if it's a variant of an ingredient we already have
          const isVariant = uniqueIngredients.some(existing => 
            isVariantOf(existing, label.name)
          );
          
          // Only add if it's not a variant
          if (!isVariant) {
            // Capitalize first letter of each word for consistency
            const formattedName = label.name
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
              
            uniqueIngredients.push(formattedName);
          }
        }
      });
      
      // Keep only a reasonable number of ingredients
      uniqueIngredients = uniqueIngredients.slice(0, 10);
      
      // If no food ingredients found, return a helpful message
      if (uniqueIngredients.length === 0) {
        return res.status(200).json({ 
          ingredients: [], 
          message: 'No food ingredients detected. Try uploading a clearer image of food items.'
        });
      }
      
      return res.status(200).json({ ingredients: uniqueIngredients });
    });
  } catch (error) {
    console.error('Error detecting ingredients:', error);
    return res.status(500).json({ error: 'Failed to detect ingredients', details: error.message });
  }
} 