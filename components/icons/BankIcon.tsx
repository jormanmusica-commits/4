import React from 'react';

// FIX: Added style prop to allow dynamic coloring. The component's props type was updated to include `style`, which is passed to the underlying SVG element. This resolves a TypeScript error where the `style` prop was passed without being declared.
const BankIcon: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={style}
  >
    <path d="M3 21h18M5 18v-8h4v8H5zm6 0v-8h4v8h-4zm6 0v-8h4v8h-4zM4 8l8-6 8 6H4z" />
  </svg>
);

export default BankIcon;