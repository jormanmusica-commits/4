import React, { useState, useEffect, useRef } from 'react';
import NumericKeypad from './NumericKeypad';

interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmitted?: () => void;
  themeColor: string;
  placeholder?: string;
  autoFocus?: boolean;
  label?: string;
  currency: string;
}

const AmountInput: React.FC<AmountInputProps> = ({ value, onChange, onSubmitted, themeColor, placeholder = "0,00", autoFocus = false, label, currency }) => {
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus) {
      // Short delay before opening the keypad to allow form animation to start
      const timer = setTimeout(() => setIsKeypadOpen(true), 150);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (isKeypadOpen && buttonRef.current) {
      // Delay scrolling to ensure the keypad is animating and layout has settled.
      const timer = setTimeout(() => {
        const element = buttonRef.current;
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          // We want to scroll the element to be about 1/3rd from the top of the viewport.
          // This ensures it's visible above the keypad.
          const idealPosition = viewportHeight / 3;
          
          // Calculate how much we need to scroll.
          const scrollOffset = elementRect.top - idealPosition;

          window.scrollBy({
            top: scrollOffset,
            behavior: 'smooth',
          });
        }
      }, 100); // Wait for keypad animation to start
      return () => clearTimeout(timer);
    }
  }, [isKeypadOpen]);

  const handleSubmit = (newValue: string) => {
    // The value from keypad is already sanitized (e.g. '123.45')
    onChange(newValue);
    setIsKeypadOpen(false);
    onSubmitted?.();
  };
  
  const displayValue = value ? value.replace('.', ',') : '';
  const locale = currency === 'COP' ? 'es-CO' : (currency === 'CLP' ? 'es-CL' : 'es-ES');
  const fallbackSymbol = currency === 'EUR' ? '€' : '$';
  const currencySymbol = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(0).find(p => p.type === 'currency')?.value || fallbackSymbol;

  return (
    <>
      <div>
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsKeypadOpen(true)}
          className={`w-full flex items-center px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#008f39]/50 focus:border-[#008f39] bg-white dark:bg-gray-700 h-[42px] ${!label ? 'min-w-[120px]' : ''}`}
          aria-label={`Current amount ${displayValue}, press to edit`}
        >
          {displayValue ? (
              <span className="text-gray-900 dark:text-gray-100">{displayValue}</span>
          ) : (
              <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          )}
          <span className="ml-auto text-gray-400">{currencySymbol}</span>
        </button>
      </div>

      <NumericKeypad
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onSubmit={handleSubmit}
        initialValue={value}
        themeColor={themeColor}
        currencySymbol={currencySymbol}
      />
    </>
  );
};

export default AmountInput;