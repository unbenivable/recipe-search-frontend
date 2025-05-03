import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetchRecipes = async () => {
    try {
      const ingredientList = ingredients.split(",").map((i) => i.trim());
      const response = await axios.post("https://web-production-9df5.up.railway.app/search", {
        ingredients: ingredientList,
      });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  };

  return (
    <div style={{ background: "#fff", color: "#000", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center" }}>Recipe Finder</h1>
      <p style={{ textAlign: "center" }}>
        Enter ingredients you already have, separated by commas
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. rice, chicken"
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button onClick={fetchRecipes} style={{ padding: "0.5rem 1rem" }}>
          Find Recipes
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
        {recipes.length === 0 ? (
          <p>No recipes found.</p>
        ) : (
          recipes.map((recipe, index) => (
            <div key={index} style={{
              border: "1px solid #ccc",
              padding: "1rem",
              width: "300px",
              borderRadius: "8px",
              backgroundColor: "#f9f9f9"
            }}>
              <h3>{recipe.title}</h3>
              <p><strong>Ingredients:</strong></p>
              <ul>
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
              {recipe.directions && (
                <div>
                  {expanded === index ? (
                    <div>
                      <h4>Directions:</h4>
                      <p>{recipe.directions}</p>
                      <button onClick={() => setExpanded(null)}>Show Less</button>
                    </div>
                  ) : (
                    <button onClick={() => setExpanded(index)}>See More</button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
