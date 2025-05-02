import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);

  const fetchRecipes = async () => {
    const inputList = ingredients
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);

    if (inputList.length === 0) return;

    try {
      const response = await fetch("https://web-production-9df5.up.railway.app/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: inputList }),
      });

      const data = await response.json();
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setRecipes([]);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial", backgroundColor: "#111", color: "#fff", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", color: "#fff" }}>Recipe Finder</h1>
      <p style={{ textAlign: "center" }}>Enter ingredients you already have, separated by commas</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. egg, chicken"
          style={{ padding: "0.5rem", width: "300px", backgroundColor: "#333", color: "#fff", border: "1px solid #555" }}
        />
        <button onClick={fetchRecipes} style={{ padding: "0.5rem 1rem", backgroundColor: "#666", color: "#fff", border: "none" }}>
          Find Recipes
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
        {recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          recipes.map((recipe, index) => (
            <div key={index} style={{ backgroundColor: "#222", padding: "1rem", borderRadius: "8px", width: "300px" }}>
              <h3>{recipe.title}</h3>
              <p><strong>Ingredients:</strong></p>
              <ul>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
              {recipe.directions && (
                <>
                  <p><strong>Directions:</strong></p>
                  <p style={{ whiteSpace: "pre-wrap" }}>{recipe.directions}</p>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
