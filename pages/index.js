"use client";
import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchRecipes = async () => {
    setLoading(true);
    setRecipes([]);
    try {
      const response = await fetch('https://YOUR-BACKEND-NAME.up.railway.app/search', {  // <-- Put your backend URL here
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: ingredients.split(',').map(i => i.trim()) }),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error searching recipes:", error);
    }
    setLoading(false);
  };

  return (
    <main style={{
      padding: "2rem",
      textAlign: "center",
      fontFamily: "Poppins, sans-serif",
      backgroundColor: "#f0f8f7",
      minHeight: "100vh"
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", color: "#333" }}>🍋 What ingredients do you have?</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="Enter ingredients (e.g. chicken, rice, lemon)"
          style={{
            padding: "0.8rem",
            borderRadius: "12px",
            border: "1px solid #ccc",
            width: "320px",
            fontSize: "1rem",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
          }}
        />
        <button
          onClick={searchRecipes}
          style={{
            marginLeft: "10px",
            padding: "0.8rem 1.5rem",
            backgroundColor: "#86C232",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontSize: "1rem",
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
          }}
        >
          Search
        </button>
      </div>

      {loading && <p style={{ fontSize: "1rem", color: "#888" }}>Searching recipes... 🔍</p>}

      <div style={{ marginTop: "2rem" }}>
        {recipes.length > 0 && (
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#555" }}>✨ Recipes Found:</h2>
        )}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {recipes.map((recipe, index) => (
            <li key={index} style={{
              background: "#fff",
              margin: "0.8rem auto",
              padding: "1rem",
              width: "90%",
              maxWidth: "500px",
              borderRadius: "12px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
            }}>
              <strong style={{ fontSize: "1.1rem" }}>{recipe.title}</strong>
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem", color: "#666" }}>
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} style={{ fontSize: "0.9rem" }}>{ing}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
