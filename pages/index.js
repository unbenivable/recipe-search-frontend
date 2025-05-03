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
      console.log("Fetched recipes:", data); // Debugging

      if (data.recipes) {
        setRecipes(data.recipes);
      } else {
        setError("No recipes found.");
      }
    } catch (err) {
      setError("Failed to fetch recipes.");
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Recipe Search</h1>
      <input
        type="text"
        placeholder="Enter ingredients (e.g. chicken, rice, broccoli)"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        style={{ width: "100%", padding: "8px", fontSize: "16px" }}
      />
      <button
        onClick={fetchRecipes}
        style={{ marginTop: "1rem", padding: "10px 20px", fontSize: "16px" }}
      >
        Search
      </button>

      {loading && <p>Loading recipes...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {recipes.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Results:</h2>
          <ul>
            {recipes.map((recipe, index) => (
              <li key={index} style={{ marginBottom: "1.5rem" }}>
                <h3>{recipe.title}</h3>
                <p><strong>Ingredients:</strong> {Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients}</p>
                <p><strong>Directions:</strong> {Array.isArray(recipe.directions) ? recipe.directions.join(" ") : recipe.directions}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
