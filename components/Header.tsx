import React from 'react';
import { Theme } from '../types';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-3xl">
        <h1 className="text-2xl md:text-3xl font-bold text-[#008f39] dark:text-[#008f39]">
          💸 Rastreador de Ingresos
        </h1>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  );
};

export default Header;