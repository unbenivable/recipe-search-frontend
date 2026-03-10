import React from 'react';
import ThemeSwitcher from './ThemeSwitcher';

const Footer: React.FC = () => {
  return (
    <footer className="footer fade-in">
      <div className="footer-content">
        <span>Niv & Gal &copy; {new Date().getFullYear()}</span>
        <span className="footer-separator" />
        <ThemeSwitcher />
      </div>
    </footer>
  );
};

export default Footer;
