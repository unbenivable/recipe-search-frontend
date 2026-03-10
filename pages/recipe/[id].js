import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function RecipePage() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

        if (router.query.data) {
          try {
            const decodedData = JSON.parse(decodeURIComponent(router.query.data));
            setRecipe(decodedData);
            setLoading(false);
            return;
          } catch (err) {
            // Failed to parse recipe data from URL
          }
        }

        setError('Recipe not found');
        setLoading(false);
      } catch (err) {
        setError('Failed to load recipe');
        setLoading(false);
      }
    }
  }, [router.query, id]);

  const handleShare = async () => {
    if (!recipe) return;

    const recipeData = encodeURIComponent(JSON.stringify(recipe));
    const shareUrl = `${window.location.origin}/recipe/${recipe.id}?data=${recipeData}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this recipe for ${recipe.title}!`,
          url: shareUrl
        });
        return;
      } catch (err) {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    } catch (err) {
      alert(`Please copy this link manually: ${shareUrl}`);
    }
  };

  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: 32, height: 32, borderColor: 'var(--border-primary)', borderTopColor: 'var(--accent)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Recipe Not Found
          </h1>
          <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            {error || 'The requested recipe could not be found.'}
          </p>
          <Link href="/" style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9375rem'
          }}>
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Head>
        <title>{recipe.title} | Ingreddit</title>
        <meta name="description" content={`Recipe for ${recipe.title} with ${recipe.ingredients.slice(0, 3).join(', ')}`} />
      </Head>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--accent)',
          textDecoration: 'none',
          fontSize: '0.9375rem',
          fontWeight: 500
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 500
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
          <ThemeSwitcher />
        </div>
      </div>

      <article style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            {recipe.title}
          </h1>

          <section style={{ marginBottom: '2rem' }}>
            <h2 className="modal-section-title">Ingredients</h2>
            <div className="modal-ingredients-grid">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="modal-ingredient-item">{ingredient}</div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="modal-section-title">Directions</h2>
            {Array.isArray(recipe.directions) ? (
              recipe.directions.map((step, index) => (
                <div key={index} className="modal-direction-step">
                  <div className="modal-step-number">{index + 1}</div>
                  <div className="modal-step-text">{step}</div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>{recipe.directions || 'No directions available'}</p>
            )}
          </section>
        </div>
      </article>

      <footer className="footer">
        <div className="footer-content">
          <span>Niv & Gal &copy; {new Date().getFullYear()}</span>
          <span className="footer-separator" />
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  );
}
