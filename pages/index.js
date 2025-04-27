import { useState } from 'react';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);

  const searchRecipes = async () => {
    const response = await fetch('https://web-production-9df5.up.railway.app/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) }),
    });
    const data = await response.json();
    setRecipes(data.recipes || []);
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', padding: '30px' }}>
      <h1 style={{ textAlign: 'center', fontSize: '3rem', marginBottom: '10px', color: '#222' }}>Recipe Finder</h1>
      <p style={{ textAlign: 'center', color: '#555', marginBottom: '40px' }}>
        Enter ingredients you already have, separated by commas
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '40px' }}>
        <input
          type="text"
          placeholder="rice, chicken"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          style={{ padding: '12px 18px', fontSize: '16px', borderRadius: '8px', border: '1px solid #ccc', width: '300px' }}
        />
        <button
          onClick={searchRecipes}
          style={{ padding: '12px 24px', fontSize: '16px', borderRadius: '8px', border: 'none', backgroundColor: '#222', color: 'white', cursor: 'pointer' }}
        >
          Find Recipes
        </button>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px', 
        padding: '0 20px' 
      }}>
        {recipes.map((recipe, idx) => (
          <div key={idx} style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#333' }}>{recipe.title}</h2>

            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>Ingredients:</h3>
              <ul style={{ paddingLeft: '20px', marginBottom: '16px', color: '#666' }}>
                {recipe.ingredients.map((ingredient, ingIdx) => (
                  <li key={ingIdx}>{ingredient}</li>
                ))}
              </ul>
            </div>

            {recipe.directions && (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>Directions:</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#666' }}>
                  {recipe.directions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
