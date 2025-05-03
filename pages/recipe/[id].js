import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function RecipePage() {
  const router = useRouter();
  const { id, title } = router.query;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we have recipe data in sessionStorage, use it
    if (typeof window !== 'undefined') {
      try {
        const storedRecipes = sessionStorage.getItem('recipeData');
        if (storedRecipes) {
          const recipes = JSON.parse(storedRecipes);
          const foundRecipe = recipes.find(r => r.id === id);
          if (foundRecipe) {
            setRecipe(foundRecipe);
            setLoading(false);
            return;
          }
        }

        // If we have encoded recipe data in the URL
        if (router.query.data) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(router.query.data));
            setRecipe(decodedData);
            setLoading(false);
            return;
          } catch (err) {
            console.error('Failed to parse recipe data from URL:', err);
          }
        }

        setError('Recipe not found');
        setLoading(false);
      } catch (err) {
        console.error('Error loading recipe:', err);
        setError('Failed to load recipe');
        setLoading(false);
      }
    }
  }, [router.query, id]);

  // Handle share click
  const handleShare = async () => {
    if (!recipe) return;
    
    // Create a shareable URL
    const recipeData = encodeURIComponent(JSON.stringify(recipe));
    const shareUrl = `${window.location.origin}/recipe/${recipe.id}?data=${recipeData}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: shareUrl
        });
        return;
      } catch (err) {
        console.log('Error sharing:', err);
        // Fall back to clipboard
      }
    }
    
    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      // If clipboard API fails, show the URL and ask user to copy manually
      alert(`Please copy this link manually: ${shareUrl}`);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            margin: "0 auto 1rem auto",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #0071e3",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p>Loading recipe...</p>
          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '1rem'
      }}>
        <h1 style={{ marginBottom: '1rem', fontSize: '24px' }}>Recipe Not Found</h1>
        <p style={{ marginBottom: '2rem' }}>{error || 'The requested recipe could not be found.'}</p>
        <Link href="/" style={{
          padding: "0.75rem 1.5rem",
          backgroundColor: "#0071e3",
          color: "white",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: "500"
        }}>
          Return to Recipe Search
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "2rem",
      maxWidth: "900px",
      margin: "0 auto",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <Head>
        <title>{recipe.title} | Recipe Finder</title>
        <meta name="description" content={`Recipe for ${recipe.title} with ${recipe.ingredients.slice(0, 3).join(', ')}`} />
      </Head>

      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          color: '#0071e3',
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
          </svg>
          Back to Search
        </Link>
        
        <button 
          onClick={handleShare}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#0071e3',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '6px' }}>
            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" fill="currentColor"/>
          </svg>
          Share Recipe
        </button>
      </div>

      <article style={{ 
        background: "white", 
        borderRadius: "20px", 
        padding: "2rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)" 
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '1.5rem', lineHeight: '1.2' }}>{recipe.title}</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '1rem', color: '#0071e3' }}>Ingredients</h2>
          <ul style={{ fontSize: '18px', paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </section>
        
        <section>
          <h2 style={{ fontSize: '22px', marginBottom: '1rem', color: '#0071e3' }}>Directions</h2>
          <div style={{ fontSize: '18px', lineHeight: '1.6' }}>
            {Array.isArray(recipe.directions) ? (
              recipe.directions.map((step, index) => (
                <p key={index} style={{ marginBottom: '1rem' }}>{step}</p>
              ))
            ) : (
              <p>{recipe.directions || 'No directions available'}</p>
            )}
          </div>
        </section>
      </article>
      
      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#8e8e93', fontSize: '14px' }}>
        <p>Niv & Gal © 2025</p>
      </div>
    </div>
  );
} 