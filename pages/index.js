import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecipes = async () => {
    setLoading(true);
    setError("");
    setRecipes([]);
    try {
      const response = await fetch("https://web-production-9df5.up.railway.app/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredients.split(",").map((ing) => ing.trim().toLowerCase()),
        }),
      });

      const data = await response.json();
      if (data.recipes) {
        setRecipes(data.recipes);
      } else {
        setError("No recipes found.");
      }
    } catch (err) {
      setError("Failed to fetch recipes.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Recipe Finder</h1>
      <p>Enter ingredients you already have, separated by commas:</p>
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. rice, chicken, broccoli"
          style={{ width: "300px", padding: "0.5rem", marginRight: "1rem" }}
        />
        <button onClick={fetchRecipes} style={{ padding: "0.5rem 1rem" }}>
          Search
        </button>
      </div>

      {loading && <p>Loading recipes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {recipes.map((recipe, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              width: "300px",
              background: "#f9f9f9",
            }}
          >
            <h3>{recipe.title}</h3>
            <p><strong>Ingredients:</strong> {recipe.ingredients?.join(", ")}</p>
            <p><strong>Directions:</strong> {recipe.directions}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
