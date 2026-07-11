'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial theme from document element
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    const newTheme = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    setIsDark(!isDark);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  );
}
