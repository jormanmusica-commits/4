import React, { useState, useEffect } from 'react';
import BackspaceIcon from './icons/BackspaceIcon';
import CheckIcon from './icons/CheckIcon';

interface NumericKeypadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  initialValue?: string;
  themeColor: string;
  currencySymbol: string;
}

const KeypadButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string; ariaLabel: string }> = ({ onClick, children, className = '', ariaLabel }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel}
    className={`flex items-center justify-center text-3xl font-light rounded-lg h-16 bg-gray-200/50 dark:bg-white/10 active:bg-gray-300/50 dark:active:bg-white/20 transition-colors duration-100 ${className}`}
  >
    {children}
  </button>
);

const NumericKeypad: React.FC<NumericKeypadProps> = ({ isOpen, onClose, onSubmit, initialValue = '', themeColor, currencySymbol }) => {
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    if (isOpen) {
      setDisplayValue(initialValue === '' || initialValue === '0' ? '0' : initialValue.replace('.', ','));
    }
  }, [isOpen, initialValue]);
  
  if (!isOpen) return null;

  const handleNumberClick = (num: string) => {
    setDisplayValue(prev => {
      if (prev === '0') return num;
      if (prev.includes(',')) {
        const parts = prev.split(',');
        if (parts[1].length >= 2) return prev;
      }
      return prev + num;
    });
  };

  const handleCommaClick = () => {
    setDisplayValue(prev => {
      if (prev.includes(',')) return prev;
      return prev + ',';
    });
  };

  const handleBackspaceClick = () => {
    setDisplayValue(prev => {
      if (prev.length === 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleClearClick = () => {
    setDisplayValue('0');
  };

  const handleSubmit = () => {
    let valueToSubmit = displayValue;
    if (valueToSubmit.endsWith(',')) {
      valueToSubmit = valueToSubmit.slice(0, -1);
    }
    onSubmit(valueToSubmit.replace(',', '.'));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 dark:bg-gray-900 w-full p-4 rounded-t-2xl shadow-2xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full text-right bg-white dark:bg-black/20 rounded-lg p-4 mb-4">
            <span className="text-5xl font-light text-gray-800 dark:text-gray-100 break-all">
                {displayValue}
            </span>
            <span className="text-3xl font-light text-gray-500 dark:text-gray-400 ml-2">{currencySymbol}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <KeypadButton onClick={() => handleNumberClick('1')} ariaLabel="1">1</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('2')} ariaLabel="2">2</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('3')} ariaLabel="3">3</KeypadButton>
          <KeypadButton onClick={handleBackspaceClick} ariaLabel="Borrar"><BackspaceIcon className="w-8 h-8" /></KeypadButton>
          
          {/* Row 2 */}
          <KeypadButton onClick={() => handleNumberClick('4')} ariaLabel="4">4</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('5')} ariaLabel="5">5</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('6')} ariaLabel="6">6</KeypadButton>
          <KeypadButton onClick={handleClearClick} ariaLabel="Limpiar" className="text-xl font-semibold text-amber-500">C</KeypadButton>
          
          {/* Row 3 */}
          <KeypadButton onClick={() => handleNumberClick('7')} ariaLabel="7">7</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('8')} ariaLabel="8">8</KeypadButton>
          <KeypadButton onClick={() => handleNumberClick('9')} ariaLabel="9">9</KeypadButton>
          
          {/* Submit button on rows 3 and 4 */}
          <div className="row-span-2">
            <button
                type="button"
                onClick={handleSubmit}
                aria-label="Confirmar"
                className="w-full h-full flex items-center justify-center rounded-lg text-white transition-colors active:brightness-90"
                style={{ backgroundColor: themeColor }}
            >
                <CheckIcon className="w-10 h-10" />
            </button>
          </div>
          
          {/* Row 4 */}
          <KeypadButton onClick={() => handleNumberClick('0')} ariaLabel="0" className="col-span-2">0</KeypadButton>
          <KeypadButton onClick={handleCommaClick} ariaLabel="Coma">,</KeypadButton>
        </div>
      </div>
    </div>
  );
};

export default NumericKeypad;
