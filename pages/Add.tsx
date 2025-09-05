import React from 'react';
import { Page } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const Add: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => onNavigate('resumen')} 
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Volver a resumen"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white ml-4">
          Añadir Transacción
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onNavigate('ingresos')}
          className="group text-left p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-[#008f39]/40 transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-[#008f39]/50"
        >
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Añadir Ingreso
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Registra tus ganancias.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('gastos')}
          className="group text-left p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-[#ef4444]/40 transition-shadow duration-300 focus:outline-none focus:ring-4 focus:ring-[#ef4444]/50"
        >
          <div className="ml-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
              Añadir Gasto
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Registra tus salidas de dinero.
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Add;