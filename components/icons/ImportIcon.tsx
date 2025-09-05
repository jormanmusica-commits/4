import React from 'react';

const ImportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2v12"></path>
    <path d="m19 9-7 7-7-7"></path>
    <path d="M5 21h14"></path>
  </svg>
);

export default ImportIcon;