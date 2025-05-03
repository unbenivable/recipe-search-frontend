import { GoogleAuth } from 'google-auth-library';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Specific food ingredients we want to prioritize
const specificIngredients = [
  // Proteins
  'chicken', 'beef', 'pork', 'salmon', 'tuna', 'shrimp', 'tofu', 'egg', 'beans',
  'turkey', 'lamb', 'crab', 'lobster', 'scallop', 'bacon', 'ham', 'sausage',
  // Vegetables
  'lettuce', 'spinach', 'kale', 'carrot', 'potato', 'onion', 'garlic', 'tomato', 'cucumber',
  'broccoli', 'cauliflower', 'bell pepper', 'zucchini', 'eggplant', 'mushroom', 'asparagus',
  'corn', 'green beans', 'peas', 'leek', 'celery', 'cabbage', 'brussels sprouts',
  // Fruits
  'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'lemon',
  'lime', 'avocado', 'peach', 'pear', 'pineapple', 'mango', 'watermelon', 'kiwi',
  // Grains & Pasta
  'rice', 'pasta', 'bread', 'cereal', 'oats', 'wheat', 'flour', 'quinoa', 'barley',
  'mac', 'macaroni', 'spaghetti', 'noodle', 'penne', 'fettuccine', 'ramen',
  // Dairy
  'milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'parmesan',
  // Specific ingredients (not categories)
  'sugar', 'salt', 'pepper', 'olive oil', 'vinegar', 'honey', 'chocolate', 'basil', 'oregano',
  'cilantro', 'thyme', 'rosemary', 'mint', 'ginger', 'cinnamon', 'cumin'
];

// Generic food categories or terms to filter out
const genericFoodTerms = [
  'food', 'ingredient', 'vegetable', 'fruit', 'meat', 'dairy', 'grain', 'herb', 'spice',
  'dish', 'meal', 'cuisine', 'recipe', 'breakfast', 'lunch', 'dinner', 'snack',
  'seafood', 'produce', 'sauce', 'syrup', 'dessert', 'baked good', 'appetizer',
  'side dish', 'beverage', 'ice cream', 'seed', 'nut'
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
                  { type: 'LABEL_DETECTION', maxResults: 30 } // Get enough labels to find specific ingredients
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
        .filter(label => label.score >= 0.75) // Only consider high-confidence labels
        .map(label => ({ 
          name: label.description,
          score: label.score
        }));
      
      console.log('Detected labels:', allLabels);
      
      // First pass: Find specific ingredients (highest priority)
      let ingredientResults = allLabels
        .filter(label => 
          specificIngredients.some(ingredient => 
            label.name.toLowerCase() === ingredient || 
            label.name.toLowerCase().includes(ingredient)
          )
        )
        .sort((a, b) => b.score - a.score) // Sort by confidence score
        .slice(0, 5) // Limit to top 5 specific ingredients
        .map(label => label.name);
      
      // Second pass: If we didn't find enough specific ingredients, try to extract from the remaining labels
      // But avoid generic terms
      if (ingredientResults.length < 2) {
        const remainingLabels = allLabels
          .filter(label => {
            const lowerName = label.name.toLowerCase();
            // Filter out generic terms
            if (genericFoodTerms.some(term => lowerName === term || lowerName.includes(term))) {
              return false;
            }
            // Don't include labels we already added
            if (ingredientResults.some(ingredient => ingredient.toLowerCase() === lowerName)) {
              return false;
            }
            return true;
          })
          .slice(0, 3) // Take up to 3 more
          .map(label => label.name);
        
        ingredientResults = [...ingredientResults, ...remainingLabels].slice(0, 5);
      }
      
      // If no food ingredients found, return a helpful message
      if (ingredientResults.length === 0) {
        return res.status(200).json({ 
          ingredients: [], 
          message: 'No specific food ingredients detected. Try uploading a clearer image of individual food items.'
        });
      }
      
      return res.status(200).json({ ingredients: ingredientResults });
    });
  } catch (error) {
    console.error('Error detecting ingredients:', error);
    return res.status(500).json({ error: 'Failed to detect ingredients', details: error.message });
  }
} 