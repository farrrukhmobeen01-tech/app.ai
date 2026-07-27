import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeId = 'midnight' | 'nordic' | 'emerald' | 'sapphire' | 'crimson' | 'amethyst' | 'obsidian';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'Dark' | 'Light';
  colors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
    border: string;
  };
}

export const THEMES: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Slate',
    tagline: 'Modern dark obsidian with subtle glass & indigo glow',
    category: 'Dark',
    colors: {
      bg: '#0a0a0c',
      card: '#12131c',
      accent: '#6366f1',
      text: '#ffffff',
      border: 'rgba(255,255,255,0.12)'
    }
  },
  {
    id: 'nordic',
    name: 'Nordic Clean',
    tagline: 'Crisp high-contrast executive light theme for focused reading',
    category: 'Light',
    colors: {
      bg: '#f8fafc',
      card: '#ffffff',
      accent: '#2563eb',
      text: '#0f172a',
      border: '#cbd5e1'
    }
  },
  {
    id: 'emerald',
    name: 'Emerald Executive',
    tagline: 'Deep forest green & gold aesthetic for luxury academic focus',
    category: 'Dark',
    colors: {
      bg: '#040d09',
      card: '#0f281f',
      accent: '#10b981',
      text: '#f0fdf4',
      border: 'rgba(52,211,153,0.25)'
    }
  },
  {
    id: 'sapphire',
    name: 'Sapphire Academic',
    tagline: 'Oceanic royal navy & cyan blue university layout',
    category: 'Dark',
    colors: {
      bg: '#050c1e',
      card: '#10224d',
      accent: '#0284c7',
      text: '#f0f9ff',
      border: 'rgba(56,189,248,0.25)'
    }
  },
  {
    id: 'crimson',
    name: 'Crimson Velvet',
    tagline: 'Rich burgundy & rose gold luxury study atmosphere',
    category: 'Dark',
    colors: {
      bg: '#120508',
      card: '#2c0e18',
      accent: '#e11d48',
      text: '#fff1f2',
      border: 'rgba(244,63,94,0.25)'
    }
  },
  {
    id: 'amethyst',
    name: 'Amethyst Royal',
    tagline: 'Majestic violet dark theme with pink highlights',
    category: 'Dark',
    colors: {
      bg: '#0c0617',
      card: '#22143e',
      accent: '#9333ea',
      text: '#faf5ff',
      border: 'rgba(168,85,247,0.25)'
    }
  },
  {
    id: 'obsidian',
    name: 'Obsidian Onyx',
    tagline: 'Ultra-pure dark monochrome with electric purple accent',
    category: 'Dark',
    colors: {
      bg: '#030305',
      card: '#0f0f17',
      accent: '#8b5cf6',
      text: '#fafafa',
      border: 'rgba(161,161,170,0.2)'
    }
  }
];

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  activeThemeOption: ThemeOption;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('campusflow_theme') as ThemeId;
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
    return 'midnight';
  });

  const setTheme = (theme: ThemeId) => {
    setCurrentThemeState(theme);
    localStorage.setItem('campusflow_theme', theme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const activeThemeOption = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, activeThemeOption }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
