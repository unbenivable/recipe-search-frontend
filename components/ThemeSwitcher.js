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
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        style={{
          backgroundColor: resolvedTheme === "dark" ? "#34c759" : "#d1d1d6",
        }}
      >
        <span 
          className="inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300"
          style={{
            transform: `translateX(${resolvedTheme === "dark" ? "20px" : "2px"})`,
          }}
        />
        
        {/* Icons inside the button */}
        <span className="absolute inset-0 flex items-center justify-between px-1.5">
          <svg 
            className={`h-3 w-3 text-amber-500 ${resolvedTheme === "dark" ? "opacity-0" : "opacity-100"} transition-opacity duration-300`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
          </svg>
          
          <svg 
            className={`h-3 w-3 text-blue-700 ${resolvedTheme === "dark" ? "opacity-100" : "opacity-0"} transition-opacity duration-300`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        </span>
      </button>
    </div>
  );
} 