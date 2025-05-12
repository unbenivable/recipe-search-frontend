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
    <div 
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      style={{
        backgroundColor: resolvedTheme === "dark" ? "#4cd964" : "#505050",
        width: "44px",
        height: "24px",
        borderRadius: "12px",
        position: "relative",
        padding: "2px",
        border: "none",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
        display: "inline-block"
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
    </div>
  );
} 