import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, AccentColor } from '../types';
import { TRANSLATIONS } from '../translations';

interface ThemeColors {
  primaryBg: string;
  primaryText: string;
  primaryBorder: string;
  hoverBg: string;
  lightBg: string;
  chartColors: string[];
}

interface ThemeContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  t: (key: keyof typeof TRANSLATIONS['en']) => string;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const COLOR_MAP: Record<AccentColor, ThemeColors> = {
  blue: {
    primaryBg: 'bg-blue-600',
    primaryText: 'text-blue-400',
    primaryBorder: 'border-blue-500',
    hoverBg: 'hover:bg-blue-500',
    lightBg: 'bg-blue-900/20',
    chartColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  },
  green: {
    primaryBg: 'bg-emerald-600',
    primaryText: 'text-emerald-400',
    primaryBorder: 'border-emerald-500',
    hoverBg: 'hover:bg-emerald-500',
    lightBg: 'bg-emerald-900/20',
    chartColors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
  },
  purple: {
    primaryBg: 'bg-violet-600',
    primaryText: 'text-violet-400',
    primaryBorder: 'border-violet-500',
    hoverBg: 'hover:bg-violet-500',
    lightBg: 'bg-violet-900/20',
    chartColors: ['#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899']
  },
  orange: {
    primaryBg: 'bg-orange-600',
    primaryText: 'text-orange-400',
    primaryBorder: 'border-orange-500',
    hoverBg: 'hover:bg-orange-500',
    lightBg: 'bg-orange-900/20',
    chartColors: ['#f97316', '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
  }
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh-TW'); // Default to zh-TW per prompt language
  const [accentColor, setAccentColor] = useState<AccentColor>('blue');

  const t = (key: keyof typeof TRANSLATIONS['en']) => {
    return TRANSLATIONS[language][key] || key;
  };

  const colors = COLOR_MAP[accentColor];

  return (
    <ThemeContext.Provider value={{ language, setLanguage, accentColor, setAccentColor, t, colors }}>
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
