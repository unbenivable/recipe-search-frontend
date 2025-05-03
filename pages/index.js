
import { useState } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    const res = await fetch('https://web-production-9df5.up.railway.app/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ingredients: ingredients.split(',').map(i => i.trim().toLowerCase())
      })
    });

    const data = await res.json();
    setRecipes(data.recipes);
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
    <div style={{ padding: 32 }}>
      <h1>Recipe Finder</h1>
      <input
        type="text"
        placeholder="Enter ingredients separated by commas"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        style={{ width: '60%', padding: 8 }}
      />
      <button onClick={handleSearch} style={{ marginLeft: 8, padding: 8 }}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      <div style={{ marginTop: 32 }}>
        {recipes.length > 0 ? (
          recipes.map((r, i) => (
            <RecipeCard key={i} {...r} />
          ))
        ) : (
          !loading && <p>No recipes found.</p>
        )}
      </div>
    </div>
  );
}

