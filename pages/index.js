import { useState } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [expanded, setExpanded] = useState({});

  const handleSearch = async () => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) }),
    });
    const data = await response.json();
    setRecipes(data.recipes || []);
  };

  const toggleExpand = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div style={{ background: '#111', color: '#fff', minHeight: '100vh', padding: '2rem' }}>
      <h1 style={{ fontSize: '2.5rem', textAlign: 'center' }}>Recipe Finder</h1>
      <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
        Enter ingredients you already have, separated by commas
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="e.g. chicken, rice"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ padding: '0.5rem', width: '300px', borderRadius: '5px', border: 'none' }}
        />
        <button onClick={handleSearch} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
          Find Recipes
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
      }}>
        {recipes.map((recipe, index) => (
          <div key={index} style={{
            background: '#fff',
            color: '#000',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}>
            <h2>{recipe.title}</h2>
            <h3>Ingredients:</h3>
            <ul>
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>

            {recipe.directions && (
              <>
                <h3>Directions:</h3>
                <p>
                  {expanded[index]
                    ? recipe.directions
                    : recipe.directions.slice(0, 300) + (recipe.directions.length > 300 ? '...' : '')}
                </p>
                {recipe.directions.length > 300 && (
                  <button
                    onClick={() => toggleExpand(index)}
                    style={{
                      marginTop: '0.5rem',
                      background: 'none',
                      border: '1px solid #000',
                      borderRadius: '5px',
                      padding: '0.3rem 0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    {expanded[index] ? 'See Less' : 'See More'}
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
