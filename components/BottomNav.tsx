import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Page } from '../types';
import HomeIcon from './icons/HomeIcon';
import GearIcon from './icons/GearIcon';
import PlusIcon from './icons/PlusIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import ScaleIcon from './icons/ScaleIcon';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const FloatingAddButton: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0, moved: false });

  const getDefaultPosition = useCallback(() => ({
    x: window.innerWidth - 88, // 80px width + 8px margin
    y: window.innerHeight - 176, // 80px height + 80px bottom nav + 16px margin
  }), []);

  const [position, setPosition] = useState(() => {
    try {
      const savedPosition = localStorage.getItem('fabPosition');
      if (savedPosition) return JSON.parse(savedPosition);
    } catch (e) { console.error("Failed to parse FAB position", e); }
    return getDefaultPosition();
  });

  const handleNavigateAndClose = (page: Page) => {
    onNavigate(page);
    setIsAddMenuOpen(false);
  };

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!dragInfo.current.isDragging) return;
    dragInfo.current.moved = true;
    
    const fabSize = 80;
    const margin = 8;
    const bottomNavHeight = 80;

    let newX = clientX - dragInfo.current.offsetX;
    let newY = clientY - dragInfo.current.offsetY;

    newX = Math.max(margin, Math.min(newX, window.innerWidth - fabSize - margin));
    newY = Math.max(margin, Math.min(newY, window.innerHeight - fabSize - margin - bottomNavHeight));

    setPosition({ x: newX, y: newY });
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      dragInfo.current = { isDragging: true, offsetX: clientX - rect.left, offsetY: clientY - rect.top, moved: false };
      fabRef.current.classList.add('dragging');
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragInfo.current.isDragging) return;
    
    if (fabRef.current) {
      fabRef.current.classList.remove('dragging');
    }

    const fabSize = 80;
    const margin = 8;
    const finalX = position.x + (fabSize / 2) > window.innerWidth / 2 
      ? window.innerWidth - fabSize - margin 
      : margin;

    const finalPosition = { ...position, x: finalX };
    setPosition(finalPosition);
    localStorage.setItem('fabPosition', JSON.stringify(finalPosition));
    
    // Use a timeout to reset moved flag, preventing click event after drag
    setTimeout(() => {
      dragInfo.current.isDragging = false;
    }, 0);
  }, [position]);

  const onMouseDown = (e: React.MouseEvent) => handleDragStart(e.clientX, e.clientY);
  const onMouseMove = useCallback((e: MouseEvent) => updatePosition(e.clientX, e.clientY), [updatePosition]);
  const onMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);

  const onTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = useCallback((e: TouchEvent) => { e.preventDefault(); updatePosition(e.touches[0].clientX, e.touches[0].clientY); }, [updatePosition]);
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  useEffect(() => {
    const isDragging = dragInfo.current.isDragging;
    if (isDragging) {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
      };
    }
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  useEffect(() => {
      const handleResize = () => {
          setPosition(currentPos => {
              const fabSize = 80;
              const margin = 8;
              const bottomNavHeight = 80;
              const newX = Math.max(margin, Math.min(currentPos.x, window.innerWidth - fabSize - margin));
              const newY = Math.max(margin, Math.min(currentPos.y, window.innerHeight - fabSize - margin - bottomNavHeight));
              const finalX = newX + (fabSize / 2) > window.innerWidth / 2 ? window.innerWidth - fabSize - margin : margin;
              const newPosition = { x: finalX, y: newY };
              localStorage.setItem('fabPosition', JSON.stringify(newPosition));
              return newPosition;
          });
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <>
      {isAddMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsAddMenuOpen(false)}
          aria-hidden="true"
        ></div>
      )}
      {isAddMenuOpen && (
           <div 
              className="fixed flex flex-col items-center gap-4 w-64 animate-fade-in z-50"
              style={{ 
                  left: position.x - 88, // Center menu on button
                  bottom: window.innerHeight - position.y + 16, // Position above button
                  transformOrigin: 'bottom center'
              }}
           >
            <button
              onClick={() => handleNavigateAndClose('ingresos')}
              className="w-full flex items-center justify-center gap-3 bg-[#008f39] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-offset-gray-900 transition-all duration-300 ease-out transform hover:-translate-y-1 active:scale-95"
            >
              <ArrowUpIcon className="w-6 h-6" />
              <span>Añadir Ingreso</span>
            </button>
            <button
              onClick={() => handleNavigateAndClose('gastos')}
              className="w-full flex items-center justify-center gap-3 bg-[#ef4444] text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-[#dc2626] focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-offset-gray-900 transition-all duration-300 ease-out transform hover:-translate-y-1 active:scale-95"
            >
              <ArrowDownIcon className="w-6 h-6" />
              <span>Añadir Gasto</span>
            </button>
          </div>
        )}
      <button
        ref={fabRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={() => !dragInfo.current.moved && setIsAddMenuOpen(prev => !prev)}
        aria-label={isAddMenuOpen ? "Cerrar menú de añadir" : "Añadir nueva transacción"}
        className={`fixed z-50 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-[#008f39]/50 ${
          isAddMenuOpen ? 'bg-gray-500 dark:bg-gray-400 dark:text-gray-800 rotate-45' : 'bg-gradient-to-br from-[#008f39] to-green-400 hover:scale-105'
        }`}
        style={{
          left: 0,
          top: 0,
          transform: `translate(${position.x}px, ${position.y}px)`,
          touchAction: 'none'
        }}
      >
        <PlusIcon className="w-10 h-10" />
      </button>
      <style>{`
        .dragging { cursor: grabbing; transition: none !important; transform: translate(${position.x}px, ${position.y}px) scale(1.05) !important; }
      `}</style>
    </>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const NavButton: React.FC<{
    onClick: () => void;
    label: string;
    isActive: boolean;
    children: React.ReactNode;
  }> = ({ onClick, label, isActive, children }) => (
    <button
      onClick={onClick}
      aria-label={`Ir a ${label}`}
      className={`flex flex-col items-center justify-center transition-colors duration-300 w-20 h-full focus:outline-none rounded-2xl ${
        isActive ? 'text-[#008f39]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {children}
      <span className="text-xs font-bold mt-1">{label}</span>
    </button>
  );

  return (
    <>
      <footer className="fixed bottom-0 inset-x-0 z-30 h-20 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] dark:shadow-none dark:border-t dark:border-white/10">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2">
            <NavButton 
                onClick={() => {
                    if (currentPage === 'resumen') {
                        onNavigate('inicio');
                    } else {
                        onNavigate('resumen');
                    }
                }} 
                label="Resumen" 
                isActive={currentPage === 'resumen' || currentPage === 'inicio'}>
                <HomeIcon className="w-7 h-7" />
            </NavButton>
            <NavButton onClick={() => onNavigate('patrimonio')} label="Patrimonio" isActive={currentPage === 'patrimonio'}>
                <ScaleIcon className="w-7 h-7" />
            </NavButton>
            <NavButton onClick={() => onNavigate('ajustes')} label="Ajustes" isActive={currentPage === 'ajustes'}>
                <GearIcon className="w-7 h-7" />
            </NavButton>
        </div>
      </footer>
      <FloatingAddButton onNavigate={onNavigate} />
    </>
  );
};

export default BottomNav;