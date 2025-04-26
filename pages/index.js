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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ingredients: ingredients.split(',').map((i) => i.trim())
        })
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes', error);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: 'Arial', textAlign: 'center', padding: '40px', backgroundColor: '#F8F6F0', minHeight: '100vh' }}>
      <h1 style={{ color: '#5D5C61' }}>🥗 Recipe Finder</h1>
      <p style={{ color: '#737373' }}>Enter ingredients you already have, separated by commas!</p>
      <input
        type="text"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        placeholder="e.g., chicken, rice, tomato"
        style={{
          padding: '10px',
          width: '80%',
          maxWidth: '400px',
          marginTop: '20px',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px'
        }}
      />
      <br />
      <button
        onClick={handleSearch}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#AED9E0',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Searching...' : 'Find Recipes'}
      </button>

      <div style={{ marginTop: '40px' }}>
        {recipes.map((recipe, index) => (
          <div key={index} style={{
            backgroundColor: '#FFF',
            padding: '15px',
            margin: '10px auto',
            width: '80%',
            maxWidth: '500px',
            borderRadius: '8px',
            boxShadow: '0px 0px 8px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#5D5C61' }}>{recipe.title}</h2>
            <ul>
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
