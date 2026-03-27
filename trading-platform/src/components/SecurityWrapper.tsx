"use client";

import { useEffect, useState, ReactNode } from "react";

export default function SecurityWrapper({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Deter keyboard shortcuts for screenshots/tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent PrintScreen natively where possible
      if (e.key === "PrintScreen") {
        navigator.clipboard.writeText(""); // Attempt to overwrite clipboard
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }
      
      // Prevent common devtools shortcuts
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }

      // Cmd+Shift+S / Cmd+Shift+3 / 4 (Mac OS shortcuts cannot be fully intercepted, but we try)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ["S", "3", "4", "5"].includes(e.key.toUpperCase())) {
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 3000);
      }
    };

    // Blur screen when window loses focus (deter background screenshot tools)
    const handleBlur = () => {
      setIsBlurred(true);
    };

    const handleFocus = () => {
      setIsBlurred(false);
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div
      className={`relative min-h-screen transition-all duration-200 ${
        isBlurred ? "blur-xl contrast-150 saturate-0 scale-95 opacity-50 select-none pointer-events-none" : ""
      }`}
    >
      {/* Invisible overlay if blurred to trap clicks */}
      {isBlurred && <div className="absolute inset-0 z-50 bg-black/50" />}
      
      {/* Watermark overlay (Deterrent: hard to crop out of screenshots) */}
      <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center opacity-[0.03] select-none text-white whitespace-pre font-mono text-3xl rotate-12 overflow-hidden mix-blend-overlay">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute whitespace-nowrap" style={{ top: `${(i - 10) * 10}%`, left: "-50%" }}>
            PREMIUM PLATFORM - DO NOT DISTRIBUTE - PREMIUM PLATFORM - DO NOT DISTRIBUTE - PREMIUM PLATFORM - DO NOT DISTRIBUTE
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}
