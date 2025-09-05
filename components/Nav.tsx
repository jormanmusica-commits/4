import React from 'react';
import { Page } from '../types';

interface NavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Nav: React.FC<NavProps> = ({ currentPage, onNavigate }) => {
  const navItems: { page: Page; label: string }[] = [
    { page: 'resumen', label: 'Resumen' },
    { page: 'ajustes', label: 'Ajustes' },
  ];

  return (
    <nav className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
      {navItems.map(({ page, label }) => (
        <button
          key={page}
          onClick={() => onNavigate(page)}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-t-md ${
            currentPage === page
              ? 'border-b-2 border-[#008f39] text-[#008f39] dark:text-[#008f39]'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {label}
        </button>
      ))}
    </nav>
  );
};

export default Nav;