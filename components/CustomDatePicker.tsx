import React, { useState, useEffect, useRef } from 'react';
import CalendarIcon from './icons/CalendarIcon';

const CustomDatePicker: React.FC<{
  value: string;
  onChange: (date: string) => void;
  min?: string;
  themeColor?: string;
  displayMode?: 'inline' | 'modal';
}> = ({ value, onChange, min, themeColor = '#008f39', displayMode = 'inline' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = new Date(value + 'T00:00:00Z');
  const [viewDate, setViewDate] = useState(selectedDate);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(new Date(value + 'T00:00:00Z'));
  }, [value]);

  useEffect(() => {
    if (displayMode !== 'inline') return;

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pickerRef, displayMode]);

  const minDateObj = min ? new Date(min + 'T00:00:00Z') : null;

  const handleDateSelect = (day: number) => {
    const newDate = new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth(), day));
    onChange(newDate.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(Date.UTC(viewDate.getUTCFullYear(), viewDate.getUTCMonth() + offset, 1)));
  };

  const renderDays = () => {
    const year = viewDate.getUTCFullYear();
    const month = viewDate.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // 0=Lunes
    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`blank-${i}`} className="w-10 h-10" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(Date.UTC(year, month, day));
      if (minDateObj && currentDate < minDateObj) {
        days.push(<div key={`hidden-${day}`} className="w-10 h-10" />);
      } else {
        const isSelected = selectedDate.getUTCFullYear() === year && selectedDate.getUTCMonth() === month && selectedDate.getUTCDate() === day;
        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const isToday = currentDate.getTime() === today.getTime();
        days.push(
          <button
            key={day}
            type="button"
            onClick={() => handleDateSelect(day)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-150 ${
              isSelected
                ? 'text-white font-bold'
                : isToday
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'text-gray-700 dark:text-gray-300'
            } hover:bg-gray-200 dark:hover:bg-gray-600`}
            style={isSelected ? { backgroundColor: themeColor } : isToday ? { color: themeColor } : {}}
          >
            {day}
          </button>
        );
      }
    }
    return days;
  };

  const formatFullDate = (dateToFormat: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    };
    const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(dateToFormat);
    
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
  
    const weekday = getPart('weekday');
    const day = getPart('day');
    const month = getPart('month');
    const year = getPart('year');
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
    
    return `${capitalize(weekday)} ${day} ${capitalize(month)} ${year}`;
  };

  const formattedSelectedDate = formatFullDate(selectedDate);
  const PrevMonthIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>);
  const NextMonthIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>);

  const calendarContent = (
    <>
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><PrevMonthIcon /></button>
        <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</span>
        <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><NextMonthIcon /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
        <div>L</div><div>M</div><div>X</div><div>J</div><div>V</div><div>S</div><div>D</div>
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </>
  );

  return (
    <div ref={pickerRef} className="relative">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(o => !o)}
          className="w-full pl-3 pr-10 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:border-transparent"
          style={{'--tw-ring-color': themeColor} as React.CSSProperties}
        >
          {formattedSelectedDate}
        </button>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {isOpen && displayMode === 'inline' && (
        <div className="absolute top-full mt-2 z-10 bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 w-full animate-fade-in">
          {calendarContent}
        </div>
      )}
      {isOpen && displayMode === 'modal' && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-4 border border-gray-200 dark:border-gray-700 w-full max-w-xs m-4"
            onClick={(e) => e.stopPropagation()}
          >
            {calendarContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
