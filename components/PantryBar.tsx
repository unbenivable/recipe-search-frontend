import React from 'react';

interface PantryBarProps {
  pantryItems: string[];
  onUseIngredient: (ingredient: string) => void;
  onUseAll: () => void;
  onRemove: (ingredient: string) => void;
  onSaveCurrent: () => void;
  currentIngredients: string;
}

const PantryBar: React.FC<PantryBarProps> = ({
  pantryItems,
  onUseIngredient,
  onUseAll,
  onRemove,
  onSaveCurrent,
  currentIngredients
}) => {
  if (pantryItems.length === 0 && !currentIngredients.trim()) return null;

  const hasCurrentIngredients = currentIngredients.trim().length > 0;
  const currentList = currentIngredients
    .split(',')
    .map(i => i.trim().toLowerCase())
    .filter(Boolean);

  // Check if there are new ingredients to save (not already in pantry)
  const hasNewToSave = hasCurrentIngredients && currentList.some(i => !pantryItems.includes(i));

  return (
    <div className="pantry-bar">
      <div className="pantry-header">
        <span className="pantry-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          My Pantry
        </span>
        <div className="pantry-actions">
          {hasNewToSave && (
            <button className="pantry-action-btn" onClick={onSaveCurrent}>
              Save current
            </button>
          )}
          {pantryItems.length > 0 && (
            <button className="pantry-action-btn" onClick={onUseAll}>
              Use all
            </button>
          )}
        </div>
      </div>

      {pantryItems.length > 0 && (
        <div className="pantry-chips">
          {pantryItems.map(item => (
            <div key={item} className="pantry-chip">
              <button
                className="pantry-chip-text"
                onClick={() => onUseIngredient(item)}
                title={`Add "${item}" to search`}
              >
                {item}
              </button>
              <button
                className="pantry-chip-remove"
                onClick={() => onRemove(item)}
                aria-label={`Remove ${item} from pantry`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PantryBar;
