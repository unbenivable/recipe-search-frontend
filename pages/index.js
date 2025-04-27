import { useState } from "react";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://web-production-9df5.up.railway.app/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingredients: ingredients.split(",") }),
        }
      );

      const data = await response.json();
      setRecipes(data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.5rem" }}>Recipe Finder</h1>
      <p style={{ textAlign: "center", marginBottom: "2rem" }}>
        Enter ingredients you already have, separated by commas
      </p>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem", gap: "1rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g., chicken, rice, tomato"
          style={{
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "300px",
            backgroundColor: "#111",
            color: "white",
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: "1rem 2rem",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Find Recipes
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading...</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "center" }}>
          {recipes.map((recipe, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #000",
                borderRadius: "10px",
                padding: "1.5rem",
                width: "300px",
                backgroundColor: "white",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{recipe.title}</h2>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Ingredients:</h3>
              <ul style={{ paddingLeft: "1.2rem", marginBottom: "1rem" }}>
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx}>{ingredient}</li>
                ))}
              </ul>
              {recipe.directions && (
                <>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Directions:</h3>
                  <p style={{ fontSize: "1rem", lineHeight: "1.5" }}>{recipe.directions}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
