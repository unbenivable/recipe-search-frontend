import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [ingredients, setIngredients] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const fetchRecipes = async () => {
    try {
      const response = await axios.post("https://web-production-9df5.up.railway.app/search", {
        ingredients: ingredients.split(",").map((i) => i.trim().toLowerCase()),
      });
      setRecipes(response.data.recipes);
      setExpanded(null);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div style={{ background: "#fff", color: "#000", padding: "2rem", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Recipe Finder</h1>
      <p style={{ textAlign: "center" }}>Enter ingredients you already have, separated by commas</p>
      <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="e.g. rice, chicken"
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button onClick={fetchRecipes} style={{ padding: "0.5rem 1rem" }}>Find Recipes</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
        {recipes.map((recipe, index) => (
          <div
            key={index}
            style={{
              background: "#f9f9f9",
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "1rem",
              width: "300px",
            }}
          >
            <h2>{recipe.title}</h2>
            <h4>Ingredients:</h4>
            <ul>
              {recipe.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>

            {recipe.directions && (
              <div>
                {
