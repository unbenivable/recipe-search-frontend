import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://web-production-9df5.up.railway.app/search',
        { ingredients: ingredients.split(',').map(i => i.trim()) }
      );
      setRecipes(response.data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    }
    setLoading(false);
  };

  const RecipeCard = ({ title, ingredients, directions }) => {
    const [expanded, setExpanded] = useState(false);
    const short = directions.slice(0, 300);

    return (
      <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
        <h3>{title}</h3>
        <p><strong>Ingredients:</strong> {ingredients.join(', ')}</p>
        <p>
          <strong>Directions:</strong>{' '}
          {expanded ? directions.join(' ') : short.join(' ') + '... '}
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? 'See Less' : 'See More'}
          </button>
        </p>
      </div>
    );
  };

  return (
    <div style={{ background: "#fff", color: "#000", padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Recipe Finder</h1>
      <p style={{ textAlign: "center" }}>Enter ingredients separated by commas (e.g. chicken, rice, broccoli)</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. rice, chicken"
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button onClick={fetchRecipes} style={{ padding: "0.5rem 1rem" }}>
          {loading ? 'Searching...' : 'Find Recipes'}
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
        {recipes.map((recipe, index) => (
          <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", width: "300px" }}>
            <h3>{recipe.title}</h3>
            <ul>
              {recipe.ingredients.slice(0, 5).map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>

            {recipe.directions && (
              <div>
                {expanded === index ? (
                  <div>
                    <h4>Directions:</h4>
                    <p>{recipe.directions.join(' ')}</p>
                    <button onClick={() => setExpanded(null)}>Show Less</button>
                  </div>
                ) : (
                  <button onClick={() => setExpanded(index)}>See More</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

