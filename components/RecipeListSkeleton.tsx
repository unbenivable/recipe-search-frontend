import React from 'react';

interface RecipeListSkeletonProps {
  count?: number;
  isMobile?: boolean;
}

const RecipeListSkeleton: React.FC<RecipeListSkeletonProps> = ({ 
  count = 12,
  isMobile = false
}) => {
  return (
    <div>
      <div className="skeleton-text-lg skeleton" style={{ width: '180px', marginBottom: '16px' }}></div>
      
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "1.5rem"
      }}>
        {Array(count).fill(0).map((_, index) => (
          <div 
            key={index} 
            className="skeleton-card"
            style={{ 
              backgroundColor: "#2e2e2e", 
              borderRadius: "16px", 
              padding: "1.5rem", 
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div className="skeleton-text-lg skeleton" style={{ width: '70%' }}></div>
            
            <div className="skeleton" style={{ 
              height: '6px',
              marginTop: '8px',
              marginBottom: '16px'
            }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div className="skeleton-text skeleton" style={{ width: '40%' }}></div>
              
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="skeleton-text skeleton" style={{ 
                  width: `${Math.floor(Math.random() * 40) + 60}%` 
                }}></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeListSkeleton; 