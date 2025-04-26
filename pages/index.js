import { useState } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setRecipes([]);
    try {
      const response = await fetch('https://web-production-9df5.up.railway.app/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) }),
      });
      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff', color: '#000', padding: '2rem', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Recipe Finder</h1>
      <p style={{ textAlign: 'center', marginBottom: '2rem' }}>
        Enter ingredients you already have, separated by commas
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g., rice, chicken"
          style={{
            padding: '0.8rem',
            width: '300px',
            fontSize: '1rem',
            border: '1px solid #000',
            borderRadius: '5px',
            marginRight: '1rem'
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '0.8rem 1.5rem',
            fontSize: '1rem',
            border: '1px solid #000',
            borderRadius: '5px',
            backgroundColor: '#000',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Searching...' : 'Find Recipes'}
        </button>
      </div>

      {recipes.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          paddingTop: '2rem'
        }}>
          {recipes.map((recipe, idx) => (
            <div key={idx} style={{
              border: '1px solid #000',
              padding: '1.5rem',
              borderRadius: '10px',
              boxShadow: '2px 2px 10px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{recipe.title}</h2>
              <ul style={{ paddingLeft: '1.2rem' }}>
                {recipe.ingredients.map((ingredient, i) => (
                  <li key={i} style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
