"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="inline-block">
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#34c759" : "#d1d1d6",
          width: "44px",
          height: "24px",
          borderRadius: "12px",
          position: "relative",
          padding: "2px",
          border: "none",
          cursor: "pointer",
          transition: "background-color 0.2s ease"
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            backgroundColor: "white",
            borderRadius: "50%",
            position: "absolute",
            top: "2px",
            left: resolvedTheme === "dark" ? "22px" : "2px",
            transition: "left 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
          }}
        />
        
        {/* Icons inside the button */}
        <div style={{ position: "absolute", width: "100%", height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 4px" }}>
          {/* Sun icon */}
          <svg 
            style={{ 
              width: "10px", 
              height: "10px", 
              opacity: resolvedTheme === "dark" ? 0 : 1,
              transition: "opacity 0.2s ease",
              color: "#fbbf24"
            }} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          
          {/* Moon icon */}
          <svg 
            style={{ 
              width: "10px", 
              height: "10px", 
              opacity: resolvedTheme === "dark" ? 1 : 0,
              transition: "opacity 0.2s ease",
              color: "#3b82f6"
            }} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </div>
      </button>
    </div>
  );
} 