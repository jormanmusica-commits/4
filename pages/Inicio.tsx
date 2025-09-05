import React from 'react';
import { Profile } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';

interface InicioProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
  onAddProfile: () => void;
  onDeleteProfile: (profileId: string) => void;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
};

const countryCodeToEmoji = (countryCode: string): string => {
    if (!countryCode || countryCode.length !== 2) return '🏳️';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

const ProfileCard: React.FC<{profile: Profile, onSelect: () => void, onDelete: () => void}> = ({ profile, onSelect, onDelete }) => {
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
    };
    
    return (
        <div
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
            aria-label={`Seleccionar perfil ${profile.name}`}
            className="relative w-full flex items-center justify-center p-4 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-amber-500/50 cursor-pointer h-24"
        >
            <div className="absolute left-0 top-0 bottom-0 w-16 group">
                <button
                    onClick={handleDeleteClick}
                    aria-label={`Eliminar perfil ${profile.name}`}
                    className="w-full h-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-opacity duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
            <span className="text-5xl drop-shadow-lg mr-4">{countryCodeToEmoji(profile.countryCode)}</span>
            <span className="font-bold text-lg text-gray-800 dark:text-gray-100">{profile.name}</span>
        </div>
    );
};

const AddProfileCard: React.FC<{onClick: () => void}> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            aria-label="Añadir nuevo perfil"
            className="relative w-full flex items-center justify-center p-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-400 dark:border-gray-600 transition-all duration-300 ease-in-out hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 text-gray-500 dark:text-gray-400 h-24"
        >
            <div className="w-[3rem] h-[3rem] mr-4 flex items-center justify-center flex-shrink-0">
                 <PlusIcon className="w-8 h-8"/>
            </div>
            <span className="font-bold text-lg">Añadir Perfil</span>
        </button>
    );
};

const Inicio: React.FC<InicioProps> = ({ profiles, onSelectProfile, onAddProfile, onDeleteProfile }) => {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gradient-to-b from-black to-gray-900 text-center p-4">
      <div className="animate-fade-in w-full max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-2">
          {greeting}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Selecciona un perfil para continuar
        </p>
        
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            {profiles.map(profile => (
                <ProfileCard 
                    key={profile.id} 
                    profile={profile} 
                    onSelect={() => onSelectProfile(profile.id)}
                    onDelete={() => onDeleteProfile(profile.id)}
                />
            ))}
            <AddProfileCard onClick={onAddProfile} />
        </div>
      </div>
    </div>
  );
};

export default Inicio;