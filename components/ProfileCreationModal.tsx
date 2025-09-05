import React, { useState } from 'react';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';

interface ProfileCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (name: string, countryCode: string, currency: string) => void;
}

const countryCodeToEmoji = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

const countries = [
    // Americas
    { code: 'AR', name: 'Argentina', currency: 'ARS' },
    { code: 'BO', name: 'Bolivia', currency: 'BOB' },
    { code: 'BR', name: 'Brasil', currency: 'BRL' },
    { code: 'CA', name: 'Canadá', currency: 'CAD' },
    { code: 'CL', name: 'Chile', currency: 'CLP' },
    { code: 'CO', name: 'Colombia', currency: 'COP' },
    { code: 'CR', name: 'Costa Rica', currency: 'CRC' },
    { code: 'CU', name: 'Cuba', currency: 'CUP' },
    { code: 'DO', name: 'República Dominicana', currency: 'DOP' },
    { code: 'EC', name: 'Ecuador', currency: 'USD' },
    { code: 'SV', name: 'El Salvador', currency: 'USD' },
    { code: 'GT', name: 'Guatemala', currency: 'GTQ' },
    { code: 'HN', name: 'Honduras', currency: 'HNL' },
    { code: 'MX', name: 'México', currency: 'MXN' },
    { code: 'NI', name: 'Nicaragua', currency: 'NIO' },
    { code: 'PA', name: 'Panamá', currency: 'PAB' },
    { code: 'PY', name: 'Paraguay', currency: 'PYG' },
    { code: 'PE', name: 'Perú', currency: 'PEN' },
    { code: 'PR', name: 'Puerto Rico', currency: 'USD' },
    { code: 'US', name: 'Estados Unidos', currency: 'USD' },
    { code: 'UY', name: 'Uruguay', currency: 'UYU' },
    { code: 'VE', name: 'Venezuela', currency: 'VES' },
    // Europe
    { code: 'DE', name: 'Alemania', currency: 'EUR' },
    { code: 'BE', name: 'Bélgica', currency: 'EUR' },
    { code: 'ES', name: 'España', currency: 'EUR' },
    { code: 'FR', name: 'Francia', currency: 'EUR' },
    { code: 'IE', name: 'Irlanda', currency: 'EUR' },
    { code: 'IT', name: 'Italia', currency: 'EUR' },
    { code: 'NL', name: 'Países Bajos', currency: 'EUR' },
    { code: 'PT', name: 'Portugal', currency: 'EUR' },
    { code: 'GB', name: 'Reino Unido', currency: 'GBP' },
    { code: 'CH', name: 'Suiza', currency: 'CHF' },
    { code: 'SE', name: 'Suecia', currency: 'SEK' },
    // Asia & Oceania
    { code: 'AU', name: 'Australia', currency: 'AUD' },
    { code: 'CN', name: 'China', currency: 'CNY' },
    { code: 'KR', name: 'Corea del Sur', currency: 'KRW' },
    { code: 'IN', name: 'India', currency: 'INR' },
    { code: 'JP', name: 'Japón', currency: 'JPY' },
    { code: 'NZ', name: 'Nueva Zelanda', currency: 'NZD' },
    // Africa
    { code: 'ZA', name: 'Sudáfrica', currency: 'ZAR' },
  ].sort((a, b) => a.name.localeCompare(b.name));


const ProfileCreationModal: React.FC<ProfileCreationModalProps> = ({ isOpen, onClose, onAddProfile }) => {
  const [profileName, setProfileName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'ES') || countries[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!profileName.trim()) {
      setError('El nombre del perfil es obligatorio.');
      return;
    }
    setError('');
    onAddProfile(profileName.trim(), selectedCountry.code, selectedCountry.currency);
    setProfileName('');
    setSelectedCountry(countries.find(c => c.code === 'ES') || countries[0]);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-creation-modal-title"
    >
      <div
        className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="profile-creation-modal-title" className="text-xl font-bold">Crear Nuevo Perfil</h2>
          <button onClick={onClose} aria-label="Cerrar modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <CloseIcon />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del Perfil
            </label>
            <input
              type="text"
              id="profile-name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Ej: Mis Finanzas Personales"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="country-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              País y Moneda
            </label>
            <select
              id="country-select"
              value={selectedCountry.code}
              onChange={(e) => {
                const country = countries.find(c => c.code === e.target.value);
                if (country) setSelectedCountry(country);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#008f39] focus:border-[#008f39] bg-gray-50 dark:bg-gray-700"
            >
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {countryCodeToEmoji(country.code)} {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-[#008f39] text-white font-bold py-3 px-4 rounded-md hover:bg-[#007a33] focus:outline-none focus:ring-2 focus:ring-[#008f39] focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors"
          >
            <PlusIcon className="w-6 h-6" /> Crear Perfil
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ProfileCreationModal;
