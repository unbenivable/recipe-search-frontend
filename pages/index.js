import { useState } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setRecipes([]);
    try {
      const response = await fetch('http://127.0.0.1:8001/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredients.split(',').map(ing => ing.trim())
        })
      });
      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'Poppins, sans-serif' }}>Recipe Search</h1>
      <p style={{ marginBottom: '1.5rem', color: '#555' }}>Enter the ingredients you have (comma-separated):</p>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{
            width: '300px',
            padding: '0.75rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
          placeholder="e.g., chicken, rice, broccoli"
        />
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading recipes...</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1000px' }}>
        {recipes.length > 0 && recipes.map((recipe, index) => (
          <div key={index} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#111' }}>{recipe.title}</h2>
            <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', color: '#555' }}>
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} style={{ marginBottom: '0.5rem' }}>{ing}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}