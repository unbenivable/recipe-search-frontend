import React from 'react';

interface RecipeListSkeletonProps {
  count?: number;
}

const RecipeListSkeleton: React.FC<RecipeListSkeletonProps> = ({ count = 9 }) => {
  return (
    <div>
      <div className="results-header">
        <div className="skeleton" style={{ width: 140, height: 16, margin: '0 auto', borderRadius: 8 }} />
      </div>

      <div className="recipe-grid">
        {Array(count).fill(0).map((_, index) => (
          <div key={index} className="skeleton-card" style={{ height: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="skeleton skeleton-text-lg" style={{ width: '65%' }} />
            <div className="skeleton" style={{ height: 24, width: 120, borderRadius: 9999 }} />
            <div className="skeleton skeleton-text" style={{ width: '30%', marginTop: 8 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 26, width: `${50 + Math.floor(Math.random() * 40)}px`, borderRadius: 9999 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeListSkeleton;
