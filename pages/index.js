import React, { useState } from "react";
import axios from "axios";

export default function Home() {
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    try {
      const ingredientsArray = ingredientsInput.split(",").map(ing => ing.trim());
      const response = await axios.post("https://web-production-9df5.up.railway.app/search", {
        ingredients: ingredientsArray,
      });
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
    }
  };

  return (
    <div style={pageStyle}>
      <h1>Recipe Finder</h1>
      <p>Enter ingredients you already have, separated by commas</p>
      <div style={searchContainerStyle}>
        <input
          type="text"
          value={ingredientsInput}
          onChange={(e) => setIngredientsInput(e.target.value)}
          placeholder="e.g., chicken, rice, broccoli"
          style={inputStyle}
        />
        <button onClick={handleSearch} style={buttonStyle}>Find Recipes</button>
      </div>

      <div style={recipeGridStyle}>
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}

function RecipeCard({ recipe }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200; // characters before "See more..." appears

  const shortDirections = recipe.directions?.length > maxLength
    ? recipe.directions.slice(0, maxLength) + "..."
    : recipe.directions;

  const shouldShowSeeMore = recipe.directions?.length > maxLength;

  return (
    <div style={cardStyle}>
      <h2>{recipe.title}</h2>

      <h3>Ingredients:</h3>
      <ul>
        {recipe.ingredients.map((ingredient, idx) => (
          <li key={idx}>{ingredient}</li>
        ))}
      </ul>

      <h3>Directions:</h3>
      <p>{expanded ? recipe.directions : shortDirections}</p>

      {shouldShowSeeMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={buttonSmallStyle}
        >
          {expanded ? "Show Less" : "See More"}
        </button>
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#111",
  color: "#fff",
  padding: "20px",
  fontFamily: "sans-serif",
  textAlign: "center",
};

const searchContainerStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "20px",
  marginBottom: "30px",
};

const inputStyle = {
  padding: "12px",
  fontSize: "16px",
  width: "300px",
  borderRadius: "8px",
  border: "none",
  outline: "none",
};

const buttonStyle = {
  padding: "12px 20px",
  backgroundColor: "white",
  color: "black",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
};

const buttonSmallStyle = {
  marginTop: "10px",
  padding: "8px 14px",
  backgroundColor: "white",
  color: "black",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontSize: "14px",
};

const recipeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  padding: "20px",
};

const cardStyle = {
  backgroundColor: "#fff",
  color: "#000",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  textAlign: "left",
};
