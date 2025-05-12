import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

const Footer: React.FC = () => {
  return (
    <div style={{
      borderTop: "1px solid #3e3e3e",
      marginTop: "2rem",
      paddingTop: "1rem",
      textAlign: "center",
      fontSize: "14px",
      color: "#a0a0a0"
    }}>
      <p style={{ marginBottom: "0.75rem" }}>Niv & Gal © {new Date().getFullYear()}</p>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
        <span>Dark mode:</span>
        <ThemeSwitcher />
      </div>
    </div>
  );
};

export default Footer; 