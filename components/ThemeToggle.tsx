import React from 'react';
import { Theme } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  const isDark = theme === Theme.DARK;
  return (
    <button
      onClick={onToggle}
      aria-label="Toggle theme"
      className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900"
    >
      {isDark ? <SunIcon className="w-6 h-6 text-amber-400" /> : <MoonIcon className="w-6 h-6 text-gray-600" />}
    </button>
  );
};

export default ThemeToggle;