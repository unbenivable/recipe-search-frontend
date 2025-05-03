import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [imageQuery, setImageQuery] = useState('');
  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('recipe'); // 'recipe', 'image', or 'detect'
  const [errorMessage, setErrorMessage] = useState('');
  const [detectLoading, setDetectLoading] = useState(false);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [detectImage, setDetectImage] = useState(null);
  const [detectRecipes, setDetectRecipes] = useState([]);
  const [detectError, setDetectError] = useState('');
  const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    lowCarb: false
  });

  // Log the backend URL for debugging
  console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

  const fetchRecipes = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      // Determine if input uses commas or spaces
      const hasCommas = ingredients.includes(',');
      
      // Process input based on delimiter
      let ingredientsArray;
      if (hasCommas) {
        // Handle comma-separated input
        ingredientsArray = ingredients.split(',').map(i => i.trim()).filter(i => i);
      } else {
        // Handle space-separated input
        ingredientsArray = ingredients.split(' ').map(i => i.trim()).filter(i => i);
      }
      
      // Enforce minimum of 3 ingredients
      if (ingredientsArray.length < 3) {
        setErrorMessage('Please enter at least 3 ingredients for better results');
        setLoading(false);
        return;
      }
      
      // Log for debugging
      console.log('Searching for ingredients:', ingredientsArray);
      
      // Add active dietary filters to the request
      const activeFilters = Object.entries(dietaryFilters)
        .filter(([_, isActive]) => isActive)
        .map(([filter]) => filter);
      
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL,
        { 
          ingredients: ingredientsArray,
          dietary: activeFilters.length > 0 ? activeFilters : undefined,
          matchAll: true // Ensure all ingredients must be present in results
        }
      );
      
      console.log('Search response:', response.data);
      setRecipes(response.data.recipes || []);
      
      // Show a message if no recipes found
      if (response.data.recipes?.length === 0) {
        const filterMessage = activeFilters.length > 0 
          ? ` matching your dietary preferences (${activeFilters.join(', ')})`
          : '';
        setErrorMessage(`No recipes found with all these ingredients${filterMessage}. Try different ingredients or filters.`);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
      setErrorMessage('Failed to fetch recipes. Please try again.');
    }
    setLoading(false);
  };

  const searchImages = async () => {
    if (!imageQuery.trim()) return;
    
    setImageLoading(true);
    setErrorMessage('');
    setImages([]);
    
    try {
      const response = await axios.post('/api/imageSearch', { query: imageQuery });
      setImages(response.data.images || []);
      if (response.data.images.length === 0) {
        setErrorMessage('No image results found. Try a different query.');
      }
    } catch (error) {
      console.error('Error searching images:', error);
      setImages([]);
      setErrorMessage(
        error.response?.data?.error || 
        'Failed to search images. Please check if API keys are configured correctly.'
      );
    }
    setImageLoading(false);
  };

  const handleDetectImageChange = (e) => {
    setDetectImage(e.target.files[0]);
    setDetectedIngredients([]);
    setDetectRecipes([]);
    setDetectError('');
  };

  const handleDetectSubmit = async (e) => {
    e.preventDefault();
    if (!detectImage) return;
    setDetectLoading(true);
    setDetectError('');
    setDetectedIngredients([]);
    setDetectRecipes([]);
    try {
      const formData = new FormData();
      formData.append('image', detectImage);
      const response = await axios.post('/api/detectIngredients', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const detected = response.data.ingredients || [];
      console.log('Detected ingredients:', detected);
      setDetectedIngredients(detected);
      
      // Check if we got a message about no food ingredients
      if (detected.length === 0 && response.data.message) {
        setDetectError(response.data.message);
        return;
      }
      
      if (detected.length > 0) {
        // Search for recipes using detected ingredients
        console.log('Searching for recipes with detected ingredients:', detected);
        
        // Add active dietary filters to the request
        const activeFilters = Object.entries(dietaryFilters)
          .filter(([_, isActive]) => isActive)
          .map(([filter]) => filter);
          
        console.log('Applied dietary filters:', activeFilters);
        
        // Only proceed if we have at least 3 ingredients
        if (detected.length < 3) {
          setDetectError('Not enough ingredients detected. Please try a different image with at least 3 visible ingredients.');
          setDetectLoading(false);
          return;
        }
        
        const recipeResp = await axios.post(
          process.env.NEXT_PUBLIC_BACKEND_URL,
          { 
            ingredients: detected,
            dietary: activeFilters.length > 0 ? activeFilters : undefined,
            matchAll: true // Ensure all ingredients must be present in results
          }
        );
        console.log('Recipe response:', recipeResp.data);
        setDetectRecipes(recipeResp.data.recipes || []);
        
        // Show a message if no recipes found
        if (recipeResp.data.recipes?.length === 0) {
          const filterMessage = activeFilters.length > 0 
            ? ` matching your dietary preferences (${activeFilters.join(', ')})`
            : '';
          setDetectError(`No recipes found with all detected ingredients${filterMessage}. Try a different image or adjust dietary filters.`);
        }
      }
    } catch (error) {
      console.error('Error detecting ingredients:', error);
      setDetectError(
        error.response?.data?.error ||
        'Failed to detect ingredients. Please try again.'
      );
    }
    setDetectLoading(false);
  };

  // Handler for toggling dietary filters
  const toggleDietaryFilter = (filter) => {
    setDietaryFilters({
      ...dietaryFilters,
      [filter]: !dietaryFilters[filter]
    });
  };

  const RecipeCard = ({ title, ingredients, directions }) => {
    const [expanded, setExpanded] = useState(false);
    const short = directions.slice(0, 300);

    return (
      <div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
        <h3>{title}</h3>
        <p><strong>Ingredients:</strong> {ingredients.join(', ')}</p>
        <p>
          <strong>Directions:</strong>{' '}
          {expanded ? directions.join(' ') : short.join(' ') + '... '}
          <button onClick={() => setExpanded(!expanded)}>
            {expanded ? 'See Less' : 'See More'}
          </button>
        </p>
      </div>
    );
  };

  return (
    <div style={{ 
      background: "#f5f5f7", 
      color: "#1d1d1f", 
      padding: "2rem", 
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", 
      maxWidth: "1200px",
      margin: "0 auto",
      minHeight: "100vh"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        fontSize: "32px", 
        fontWeight: "600", 
        marginBottom: "2rem", 
        color: "#1d1d1f"
      }}>Recipe Finder</h1>

      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "2rem",
        background: "#e8e8ed",
        padding: "4px",
        borderRadius: "12px",
        maxWidth: "600px",
        margin: "0 auto 2rem auto"
      }}>
        <button 
          onClick={() => setSearchMode('recipe')}
          style={{ 
            padding: "0.75rem 1.25rem", 
            backgroundColor: searchMode === 'recipe' ? "#ffffff" : "transparent",
            color: searchMode === 'recipe' ? "#1d1d1f" : "#1d1d1f",
            border: "none",
            borderRadius: "10px",
            fontWeight: searchMode === 'recipe' ? "600" : "400",
            fontSize: "15px",
            flex: 1,
            boxShadow: searchMode === 'recipe' ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          Search by Ingredients
        </button>
        <button 
          onClick={() => setSearchMode('image')}
          style={{ 
            padding: "0.75rem 1.25rem", 
            backgroundColor: searchMode === 'image' ? "#ffffff" : "transparent",
            color: searchMode === 'image' ? "#1d1d1f" : "#1d1d1f",
            border: "none",
            fontWeight: searchMode === 'image' ? "600" : "400",
            fontSize: "15px",
            flex: 1,
            borderRadius: "10px",
            boxShadow: searchMode === 'image' ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          Generate Food Image
        </button>
        <button 
          onClick={() => setSearchMode('detect')}
          style={{ 
            padding: "0.75rem 1.25rem", 
            backgroundColor: searchMode === 'detect' ? "#ffffff" : "transparent",
            color: searchMode === 'detect' ? "#1d1d1f" : "#1d1d1f",
            border: "none",
            borderRadius: "10px",
            fontWeight: searchMode === 'detect' ? "600" : "400",
            fontSize: "15px",
            flex: 1,
            boxShadow: searchMode === 'detect' ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s ease"
          }}
        >
          Detect Ingredients from Image
        </button>
      </div>

      {errorMessage && searchMode !== 'detect' && (
        <div style={{ 
          color: "#e03131", 
          textAlign: "center", 
          margin: "1rem auto", 
          padding: "0.75rem 1rem", 
          backgroundColor: "#fff8f8",
          borderRadius: "10px",
          maxWidth: "600px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          {errorMessage}
        </div>
      )}

      {searchMode === 'recipe' ? (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <p style={{ 
            textAlign: "center", 
            fontSize: "16px", 
            color: "#636366",
            marginBottom: "1.5rem"
          }}>
            Enter at least 3 ingredients separated by commas or spaces (e.g. chicken rice garlic)
            {Object.values(dietaryFilters).some(v => v) && (
              <span style={{ display: "block", marginTop: "0.5rem", fontWeight: "500", color: "#34c759" }}>
                Active filters: {Object.entries(dietaryFilters)
                  .filter(([_, isActive]) => isActive)
                  .map(([filter]) => filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                  .join(', ')}
              </span>
            )}
          </p>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "0.75rem", 
            marginBottom: "2rem" 
          }}>
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
            }}>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    fetchRecipes();
                  }
                }}
                placeholder="e.g. rice chicken garlic"
                style={{ 
                  padding: "0.85rem 1rem", 
                  paddingRight: "3.5rem",
                  width: "100%", 
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "16px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              />
              <button 
                onClick={fetchRecipes} 
                style={{ 
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.5rem",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#0071e3",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,113,227,0.3)",
                  transition: "all 0.2s ease"
                }}
                disabled={loading}
                aria-label="Search recipes"
              >
                {loading ? (
                  <span style={{ fontSize: "12px" }}>...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div style={{ 
            maxWidth: "600px",
            margin: "0 auto 2.5rem auto",
            background: "white",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
          }}>
            <div style={{ 
              borderBottom: "1px solid #f2f2f7", 
              paddingBottom: "0.75rem", 
              marginBottom: "1rem" 
            }}>
              <h3 style={{ 
                fontSize: "17px", 
                fontWeight: "600", 
                color: "#1d1d1f", 
                margin: 0 
              }}>
                Dietary Preferences
              </h3>
            </div>
            
            {Object.entries(dietaryFilters).map(([filter, isActive]) => (
              <div key={filter} style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: "1px solid #f2f2f7"
              }}>
                <span style={{ fontSize: "16px", color: "#1d1d1f" }}>
                  {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </span>
                
                <div
                  onClick={() => toggleDietaryFilter(filter)}
                  style={{
                    width: "51px",
                    height: "31px",
                    backgroundColor: isActive ? "#34c759" : "#d1d1d6",
                    borderRadius: "15.5px",
                    padding: "2px",
                    position: "relative",
                    transition: "background-color 0.2s ease",
                    cursor: "pointer"
                  }}
                >
                  <div
                    style={{
                      width: "27px",
                      height: "27px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      position: "absolute",
                      top: "2px",
                      left: isActive ? "22px" : "2px",
                      transition: "left 0.2s ease",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                    }}
                  />
                </div>
              </div>
            ))}
            
            {Object.values(dietaryFilters).some(v => v) && (
              <button
                onClick={() => setDietaryFilters({
                  vegetarian: false,
                  vegan: false,
                  glutenFree: false,
                  dairyFree: false,
                  lowCarb: false
                })}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  marginTop: "1rem",
                  backgroundColor: "transparent",
                  color: "#0071e3",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "1.5rem", 
            justifyContent: "center" 
          }}>
            {recipes.map((recipe, index) => (
              <div 
                key={index} 
                style={{ 
                  background: "white",
                  borderRadius: "16px", 
                  padding: "1.5rem", 
                  width: "100%", 
                  maxWidth: "350px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
                }}
              >
                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  marginTop: 0,
                  marginBottom: "1rem",
                  color: "#1d1d1f"
                }}>
                  {recipe.title}
                </h3>
                
                <h4 style={{ 
                  fontSize: "15px", 
                  fontWeight: "600", 
                  color: "#636366",
                  marginBottom: "0.5rem" 
                }}>
                  Ingredients:
                </h4>
                
                <ul style={{ 
                  paddingLeft: "1.25rem", 
                  marginBottom: "1.25rem", 
                  color: "#1d1d1f" 
                }}>
                  {recipe.ingredients.slice(0, 5).map((ing, i) => (
                    <li key={i} style={{ marginBottom: "0.25rem", fontSize: "15px" }}>{ing}</li>
                  ))}
                </ul>

                {recipe.directions && (
                  <div>
                    {expanded === index ? (
                      <div>
                        <h4 style={{ 
                          fontSize: "15px", 
                          fontWeight: "600", 
                          color: "#636366",
                          marginBottom: "0.5rem" 
                        }}>
                          Directions:
                        </h4>
                        <p style={{ 
                          fontSize: "15px", 
                          lineHeight: "1.5", 
                          color: "#1d1d1f" 
                        }}>
                          {recipe.directions.join(' ')}
                        </p>
                        <button 
                          onClick={() => setExpanded(null)}
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            marginTop: "1rem",
                            backgroundColor: "#f5f5f7",
                            color: "#0071e3",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "15px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          Show Less
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setExpanded(index)}
                        style={{
                          width: "100%",
                          padding: "0.6rem",
                          backgroundColor: "#f5f5f7",
                          color: "#0071e3",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "15px",
                          fontWeight: "500",
                          cursor: "pointer"
                        }}
                      >
                        View Directions
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : searchMode === 'image' ? (
        <>
          <p style={{ textAlign: "center", fontSize: "16px", color: "#636366", marginBottom: "1.5rem" }}>
            Search for food images (e.g. "pancakes with strawberries")
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "2rem" }}>
            <div style={{
              position: "relative",
              width: "100%",
              maxWidth: "400px",
            }}>
              <input
                type="text"
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchImages();
                  }
                }}
                placeholder="e.g. chocolate cake"
                style={{ 
                  padding: "0.85rem 1rem", 
                  paddingRight: "3.5rem",
                  width: "100%", 
                  borderRadius: "12px",
                  border: "none",
                  fontSize: "16px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              />
              <button 
                onClick={searchImages} 
                style={{ 
                  position: "absolute",
                  right: "8px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  padding: "0.5rem",
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#0071e3",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: imageLoading ? "not-allowed" : "pointer",
                  opacity: imageLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(0,113,227,0.3)",
                  transition: "all 0.2s ease"
                }}
                disabled={imageLoading}
                aria-label="Search images"
              >
                {imageLoading ? (
                  <span style={{ fontSize: "12px" }}>...</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="white"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {imageLoading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <p>Generating food images with AI...</p>
              <div style={{ 
                width: "40px", 
                height: "40px", 
                margin: "0 auto",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #007bff",
                borderRadius: "50%",
                animation: "spin 2s linear infinite"
              }}></div>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              {images.length > 0 ? (
                <div 
                  style={{ 
                    width: "400px", 
                    height: "400px", 
                    overflow: "hidden", 
                    borderRadius: "12px",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
                    transition: "transform 0.3s ease",
                    cursor: "pointer"
                  }}
                >
                  <img 
                    src={images[0]?.url} 
                    alt={images[0]?.alt || "Generated food image"} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover" 
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x400?text=Image+Error";
                    }}
                  />
                </div>
              ) : (
                !imageLoading && !errorMessage && (
                  <p style={{ textAlign: "center", padding: "2rem" }}>
                    Search for food images to see results here
                  </p>
                )
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <p style={{ textAlign: "center" }}>
            Upload a food image to detect ingredients and find recipes.
            {Object.values(dietaryFilters).some(v => v) && (
              <span style={{ display: "block", marginTop: "0.5rem", fontWeight: "500", color: "#34c759" }}>
                Active filters: {Object.entries(dietaryFilters)
                  .filter(([_, isActive]) => isActive)
                  .map(([filter]) => filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
                  .join(', ')}
              </span>
            )}
          </p>
          <form onSubmit={handleDetectSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center', gap: '12px' }}>
                <label 
                  htmlFor="uploadImage"
                  style={{ 
                    padding: "0.85rem 1rem",
                    backgroundColor: "white",
                    color: "#0071e3",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#0071e3"/>
                  </svg>
                  <span>Select Image</span>
                  <input 
                    type="file" 
                    id="uploadImage"
                    accept="image/*" 
                    onChange={handleDetectImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <label 
                  htmlFor="cameraInput"
                  style={{ 
                    padding: "0.85rem 1rem",
                    backgroundColor: "white",
                    color: "#34c759",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 15c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" fill="#34c759"/>
                    <path d="M20 4h-3.17l-1.24-1.35c-.37-.41-.91-.65-1.47-.65H9.88c-.56 0-1.1.24-1.48.65L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="#34c759"/>
                  </svg>
                  <span>Open Camera</span>
                  <input 
                    type="file" 
                    id="cameraInput"
                    accept="image/*" 
                    capture="environment"
                    onChange={handleDetectImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {detectImage && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <p>Selected: {detectImage.name}</p>
                  {/* Optional: Show image preview */}
                  <div style={{ 
                    width: '150px', 
                    height: '150px', 
                    margin: '0 auto',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img 
                      src={detectImage ? URL.createObjectURL(detectImage) : ''} 
                      alt="Preview" 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Dietary Preferences */}
            <div style={{ 
              maxWidth: "400px",
              width: "100%",
              margin: "1rem auto",
              background: "white",
              padding: "1.5rem",
              borderRadius: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
            }}>
              <div style={{ 
                borderBottom: "1px solid #f2f2f7", 
                paddingBottom: "0.75rem", 
                marginBottom: "1rem" 
              }}>
                <h3 style={{ 
                  fontSize: "17px", 
                  fontWeight: "600", 
                  color: "#1d1d1f", 
                  margin: 0 
                }}>
                  Dietary Preferences
                </h3>
              </div>
              
              {Object.entries(dietaryFilters).map(([filter, isActive]) => (
                <div key={filter} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid #f2f2f7"
                }}>
                  <span style={{ fontSize: "16px", color: "#1d1d1f" }}>
                    {filter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                  
                  <div
                    onClick={() => toggleDietaryFilter(filter)}
                    style={{
                      width: "51px",
                      height: "31px",
                      backgroundColor: isActive ? "#34c759" : "#d1d1d6",
                      borderRadius: "15.5px",
                      padding: "2px",
                      position: "relative",
                      transition: "background-color 0.2s ease",
                      cursor: "pointer"
                    }}
                  >
                    <div
                      style={{
                        width: "27px",
                        height: "27px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        position: "absolute",
                        top: "2px",
                        left: isActive ? "22px" : "2px",
                        transition: "left 0.2s ease",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                      }}
                    />
                  </div>
                </div>
              ))}
              
              {Object.values(dietaryFilters).some(v => v) && (
                <button
                  onClick={() => setDietaryFilters({
                    vegetarian: false,
                    vegan: false,
                    glutenFree: false,
                    dairyFree: false,
                    lowCarb: false
                  })}
                  style={{
                    width: "100%",
                    padding: "0.6rem",
                    marginTop: "1rem",
                    backgroundColor: "transparent",
                    color: "#0071e3",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "15px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
            
            <button 
              type="submit"
              style={{ 
                padding: "0.85rem 1rem",
                backgroundColor: "#0071e3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: detectLoading ? "not-allowed" : "pointer",
                opacity: detectLoading ? 0.7 : 1,
                width: '100%',
                maxWidth: '400px',
                fontSize: "16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0,113,227,0.3)",
                transition: "all 0.2s ease"
              }}
              disabled={detectLoading || !detectImage}
            >
              {detectLoading ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 1s linear infinite", marginRight: "8px" }}></span>
                  <span>Detecting...</span>
                </div>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: "8px" }} fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 12.5c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
                  </svg>
                  <span>Detect Ingredients & Find Recipes</span>
                </>
              )}
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </button>
          </form>
          {detectError && (
            <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>{detectError}</div>
          )}
          {detectedIngredients.length > 0 && (
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h3>Detected Ingredients:</h3>
              <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: '#f0f0f0', borderRadius: '8px' }}>
                {detectedIngredients.join(', ')}
              </div>
            </div>
          )}
          {detectRecipes.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
              {detectRecipes.map((recipe, index) => (
                <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "1rem", width: "300px" }}>
                  <h3>{recipe.title}</h3>
                  <ul>
                    {recipe.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                  {recipe.directions && (
                    <div>
                      <button onClick={() => setExpanded(expanded === index ? null : index)}>
                        {expanded === index ? 'Show Less' : 'See More'}
                      </button>
                      {expanded === index && (
                        <div>
                          <h4>Directions:</h4>
                          <p>{recipe.directions.join(' ')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

