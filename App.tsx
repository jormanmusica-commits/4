import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Theme, Transaction, Page, Category, BankAccount, FixedExpense, Profile, ProfileData, Asset, Liability, Loan } from './types';
import Inicio from './pages/Inicio';
import Resumen from './pages/Resumen';
import Ajustes from './pages/Ajustes';
import BottomNav from './components/BottomNav';
import Ingresos from './pages/Ingresos';
import Gastos from './pages/Gastos';
import Patrimonio from './pages/Patrimonio';
import TransferModal from './components/TransferModal';
import { validateTransactionChange, findFirstIncomeDate } from './utils/transactionUtils';
import ProfileCreationModal from './components/ProfileCreationModal';
import { exportProfileToCsv } from './utils/exportUtils';
import FixedExpenseModal from './components/FixedExpenseModal';
import AssetLiabilityModal from './components/AssetLiabilityModal';
import PlusIcon from './components/icons/PlusIcon';
import ArrowUpIcon from './components/icons/ArrowUpIcon';
import ArrowDownIcon from './components/icons/ArrowDownIcon';
import ScaleIcon from './components/icons/ScaleIcon';


const CASH_METHOD_ID = 'efectivo';

const defaultCategories: Category[] = [
  { id: '1', name: 'Comida', icon: 'Food', color: '#008f39' },
  { id: '2', name: 'Transporte', icon: 'Transport', color: '#3b82f6' },
  { id: '3', name: 'Ropa', icon: 'Clothing', color: '#ec4899' },
  { id: '4', name: 'Hogar', icon: 'House', color: '#f97316' },
  { id: '5', name: 'Entretenimiento', icon: 'Entertainment', color: '#8b5cf6' },
  { id: '6', name: 'Salud', icon: 'Health', color: '#ef4444' },
  { id: '8', name: 'Ahorro', icon: 'Tag', color: '#14b8a6' },
  { id: '9', name: 'Préstamos', icon: 'Scale', color: '#3b82f6' },
  { id: '7', name: 'General', icon: 'ArrowDown', color: '#ef4444' },
];

const defaultBankAccounts: BankAccount[] = [
  { id: 'default-bank', name: 'BBVA', color: '#3b82f6' },
];

const createDefaultProfileData = (): ProfileData => ({
    transactions: [],
    bankAccounts: defaultBankAccounts,
    categories: defaultCategories,
    fixedExpenses: [],
    assets: [],
    liabilities: [],
    loans: [],
});


// =======================================================
// START: FloatingActionButton Component Definition
// =======================================================
export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string;
  disabled?: boolean;
}

interface FloatingActionButtonProps {
  menuItems: MenuItem[];
  buttonClass: string;
  ringColorClass: string;
  position: { x: number, y: number };
  onPositionChange: (position: { x: number, y: number }) => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ menuItems, buttonClass, ringColorClass, position, onPositionChange }) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const dragInfo = useRef({ isDragging: false, offsetX: 0, offsetY: 0, moved: false });

  const handleClick = () => {
    // Si `moved` es true, significa que se acaba de completar un arrastre. No queremos alternar el menú.
    if (!dragInfo.current.moved) {
      setIsAddMenuOpen(prev => !prev);
    }
    // Después de cualquier clic o liberación de arrastre, reiniciamos el estado `moved` para la siguiente interacción.
    dragInfo.current.moved = false;
  };

  const handleMenuClick = (item: MenuItem) => {
    if(item.disabled) return;
    item.onClick();
    setIsAddMenuOpen(false);
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragInfo.current.isDragging) return;
    if (e.type === 'touchmove') {
      e.preventDefault(); // Evita el desplazamiento de la página mientras se arrastra
    }
    dragInfo.current.moved = true; // Se ha producido un arrastre.
    
    const event = 'touches' in e ? e.touches[0] : e;
    const fabSize = 80;
    const margin = 8;
    const bottomNavHeight = 80;

    let newX = event.clientX - dragInfo.current.offsetX;
    let newY = event.clientY - dragInfo.current.offsetY;

    // Limitar al área visible
    newX = Math.max(margin, Math.min(newX, window.innerWidth - fabSize - margin));
    newY = Math.max(margin, Math.min(newY, window.innerHeight - fabSize - margin - bottomNavHeight));

    onPositionChange({ x: newX, y: newY });
  }, [onPositionChange]);

  const handleDragEnd = useCallback(() => {
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove);
    document.removeEventListener('touchend', handleDragEnd);

    if (fabRef.current) {
      fabRef.current.classList.remove('dragging');
    }
    
    dragInfo.current.isDragging = false;
    // La lógica de ajuste a los bordes y de alternar el menú se ha eliminado de aquí.
  }, [handleDragMove]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const event = 'touches' in e ? e.touches[0] : e;
    if (fabRef.current) {
        const rect = fabRef.current.getBoundingClientRect();
        // Reiniciar `moved` al comienzo de cada interacción.
        dragInfo.current = {
            isDragging: true,
            offsetX: event.clientX - rect.left,
            offsetY: event.clientY - rect.top,
            moved: false,
        };
        fabRef.current.classList.add('dragging');

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }
  }, [handleDragMove, handleDragEnd]);
  
  const isFabOnLeft = position.x < window.innerWidth / 2;
  const menuStyle: React.CSSProperties = {
    bottom: window.innerHeight - position.y + 16,
    transformOrigin: isFabOnLeft ? 'bottom left' : 'bottom right',
  };
  if (isFabOnLeft) {
    menuStyle.left = position.x;
  } else {
    menuStyle.left = position.x + 80 - 256;
  }
  
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
              className="fixed flex flex-col items-center gap-4 w-64 animate-scale-in-up z-50"
              style={menuStyle}
           >
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item)}
                disabled={item.disabled}
                className="w-full flex items-center justify-center gap-3 text-white font-bold py-3 px-6 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-white dark:focus:ring-offset-gray-900 transition-all duration-300 ease-out transform disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:-translate-y-1 enabled:active:scale-95 enabled:hover:brightness-110"
                style={{ backgroundColor: item.color }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      <button
        ref={fabRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={handleClick}
        aria-label={isAddMenuOpen ? "Cerrar menú" : "Abrir menú de acciones"}
        className={`fixed z-50 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 ${
          isAddMenuOpen ? 'bg-gray-500 dark:bg-gray-400 dark:text-gray-800 rotate-45' : `${buttonClass} ${ringColorClass} hover:scale-105`
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
// =======================================================
// END: FloatingActionButton Component Definition
// =======================================================


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || Theme.DARK;
  });

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const savedProfiles = localStorage.getItem('profiles');
    if (savedProfiles) return JSON.parse(savedProfiles);

    const legacyTransactions = localStorage.getItem('transactions');
    if (legacyTransactions) { // Migration logic for existing users
        const transactions = JSON.parse(legacyTransactions);
        const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts') || 'null') || defaultBankAccounts;
        const categories = JSON.parse(localStorage.getItem('categories') || 'null') || defaultCategories;
        const fixedExpenses = JSON.parse(localStorage.getItem('fixedExpenses') || 'null') || [];
        
        const migratedProfile: Profile = {
            id: crypto.randomUUID(),
            name: 'España',
            countryCode: 'ES',
            currency: 'EUR',
            data: { 
                transactions, bankAccounts, categories, fixedExpenses, 
                assets: [], liabilities: [], loans: []
            }
        };
        return [migratedProfile];
    }

    // New user
    const defaultProfileSpain: Profile = {
        id: crypto.randomUUID(),
        name: 'España',
        countryCode: 'ES',
        currency: 'EUR',
        data: createDefaultProfileData()
    };
    const defaultProfileColombia: Profile = {
        id: crypto.randomUUID(),
        name: 'Colombia',
        countryCode: 'CO',
        currency: 'COP',
        data: createDefaultProfileData()
    };
    const defaultProfileChile: Profile = {
        id: crypto.randomUUID(),
        name: 'Chile',
        countryCode: 'CL',
        currency: 'CLP',
        data: createDefaultProfileData()
    };
    return [defaultProfileSpain, defaultProfileColombia, defaultProfileChile];
  });
  
  const [activeProfileId, setActiveProfileId] = useState<string | null>(() => {
    const savedId = localStorage.getItem('activeProfileId');
    // Can't check against state here, so we re-read from localStorage
    const savedProfiles = localStorage.getItem('profiles'); 
    const initialProfiles: Profile[] = savedProfiles ? JSON.parse(savedProfiles) : [];
    if (savedId && (initialProfiles.length > 0 ? initialProfiles.some(p => p.id === savedId) : true)) { // Allow savedId if profiles aren't loaded yet
        return savedId;
    }
    return profiles[0]?.id || null;
  });
  
  const [currentPage, setCurrentPage] = useState<Page>('inicio');
  const [transferDirection, setTransferDirection] = useState<'deposit' | 'withdrawal' | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isProfileCreationModalOpen, setIsProfileCreationModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isAssetLiabilityModalOpen, setIsAssetLiabilityModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: 'asset' | 'liability' | 'loan' } | null>(null);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

    const getDefaultFabPosition = useCallback(() => ({
    x: window.innerWidth - 88, // 80px width + 8px margin
    y: window.innerHeight - 176, // 80px height + 80px bottom nav + 16px margin
  }), []);

  const [fabPosition, setFabPosition] = useState(() => {
    try {
      const savedPosition = localStorage.getItem('fabPosition');
      if (savedPosition) return JSON.parse(savedPosition);
    } catch (e) { console.error("Failed to parse FAB position", e); }
    return getDefaultFabPosition();
  });

  useEffect(() => {
    localStorage.setItem('fabPosition', JSON.stringify(fabPosition));
  }, [fabPosition]);

  useEffect(() => {
    const handleResize = () => {
        setFabPosition(currentPos => {
            const fabSize = 80;
            const margin = 8;
            const bottomNavHeight = 80;
            
            // Simplemente mantener dentro de los límites, sin ajustar a los bordes.
            const newX = Math.max(margin, Math.min(currentPos.x, window.innerWidth - fabSize - margin));
            const newY = Math.max(margin, Math.min(currentPos.y, window.innerHeight - fabSize - margin - bottomNavHeight));

            return { x: newX, y: newY };
        });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('profiles', JSON.stringify(profiles));
    // After first save of profiles, if we migrated, clean up old keys
    if (localStorage.getItem('transactions')) {
        localStorage.removeItem('transactions');
        localStorage.removeItem('bankAccounts');
        localStorage.removeItem('categories');
        localStorage.removeItem('fixedExpenses');
    }
  }, [profiles]);

  useEffect(() => {
    if(activeProfileId) {
        localStorage.setItem('activeProfileId', activeProfileId);
    } else {
        localStorage.removeItem('activeProfileId');
    }
  }, [activeProfileId]);


  const updateActiveProfileData = (updater: (data: ProfileData) => ProfileData) => {
    if (!activeProfileId) return;
    setProfiles(prevProfiles => prevProfiles.map(p => 
        p.id === activeProfileId ? { ...p, data: updater(p.data) } : p
    ));
  };

  const handleToggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
  }, []);
  
  const handleAddTransaction = useCallback((description: string, amount: number, date: string, type: 'income' | 'expense', paymentMethodId: string, categoryId?: string) => {
    if (!activeProfile) return;

    let finalCategoryId = categoryId;
    if (type === 'expense' && !categoryId) {
        const generalCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'general');
        if (generalCategory) {
            finalCategoryId = generalCategory.id;
        }
    }

    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount,
      date,
      type,
      paymentMethodId,
      categoryId: finalCategoryId,
    };

    if (type === 'expense') {
        const firstIncomeDate = findFirstIncomeDate(activeProfile.data.transactions);
        const expenseDate = new Date(date);
        expenseDate.setUTCHours(0, 0, 0, 0);

        if (firstIncomeDate && expenseDate < firstIncomeDate) {
            alert('Error: No puedes registrar un gasto en una fecha anterior a tu primer ingreso.');
            return;
        }
    }

    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }
    
    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
  }, [activeProfile]);
  
  const handleAddTransfer = useCallback((fromMethodId: string, toMethodId: string, amount: number, date: string): string | void => {
    if (!activeProfile) return "No active profile found.";
    
    const transferId = crypto.randomUUID();

    const fromName = fromMethodId === CASH_METHOD_ID ? 'Efectivo' : activeProfile.data.bankAccounts.find(b => b.id === fromMethodId)?.name || 'Banco';
    const toName = toMethodId === CASH_METHOD_ID ? 'Efectivo' : activeProfile.data.bankAccounts.find(b => b.id === toMethodId)?.name || 'Banco';
    const transferDescription = `Transferencia: ${fromName} → ${toName}`;

    const expenseTransaction: Transaction = { id: crypto.randomUUID(), description: transferDescription, amount, date, type: 'expense', paymentMethodId: fromMethodId, transferId };
    const incomeTransaction: Transaction = { id: crypto.randomUUID(), description: transferDescription, amount, date, type: 'income', paymentMethodId: toMethodId, transferId };
    
    const updatedTransactions = [expenseTransaction, incomeTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
      return validationError;
    }

    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
    setIsTransferModalOpen(false);
    setTransferDirection(null);
    setCurrentPage('resumen');
}, [activeProfile]);

  const handleUpdateTransaction = useCallback((id: string, newDescription: string, newAmount: number): string | void => {
    if (!activeProfile) return "No se encontró un perfil activo.";

    const transactionToUpdate = activeProfile.data.transactions.find(t => t.id === id);
    if (!transactionToUpdate) return "No se encontró la transacción.";
    
    if (transactionToUpdate.transferId || transactionToUpdate.patrimonioId) {
        return "Las transferencias y los movimientos de patrimonio no se pueden editar directamente.";
    }

    const updatedTransactions = activeProfile.data.transactions.map(t =>
        t.id === id ? { ...t, description: newDescription, amount: newAmount } : t
    );

    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
    if (validationError) {
        return validationError;
    }
    
    updateActiveProfileData(data => ({
        ...data,
        transactions: updatedTransactions
    }));
  }, [activeProfile]);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (!activeProfile) return;

    const transactionToDelete = activeProfile.data.transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    const isTransfer = !!transactionToDelete.transferId;
    const isPatrimonio = !!transactionToDelete.patrimonioId;
    let confirmMessage = `¿Estás seguro de que quieres eliminar esta transacción?`;
    if (isTransfer) {
        confirmMessage = `Esta es una transferencia. ¿Estás seguro de que quieres eliminar ambas partes de la transacción?`;
    } else if (isPatrimonio) {
        const typeText = transactionToDelete.patrimonioType === 'asset' ? 'el ahorro' : 'el préstamo';
        confirmMessage = `Esta transacción está vinculada a un movimiento de patrimonio. Eliminarla también eliminará ${typeText} asociado. ¿Estás seguro?`;
    }
    
    if (!window.confirm(confirmMessage)) {
        return;
    }

    let transactionsToRemoveIds = [id];
    let updatedAssets = activeProfile.data.assets;
    let updatedLoans = activeProfile.data.loans;

    if (transactionToDelete.patrimonioId && transactionToDelete.patrimonioType) {
        if (transactionToDelete.patrimonioType === 'asset') {
            updatedAssets = (activeProfile.data.assets || []).filter(item => item.id !== transactionToDelete.patrimonioId);
        } else if (transactionToDelete.patrimonioType === 'loan') {
            updatedLoans = (activeProfile.data.loans || []).filter(item => item.id !== transactionToDelete.patrimonioId);
        }
    }

    if (transactionToDelete.transferId) {
        const otherPartOfTransfer = activeProfile.data.transactions.find(t => t.transferId === transactionToDelete.transferId && t.id !== id);
        if (otherPartOfTransfer) transactionsToRemoveIds.push(otherPartOfTransfer.id);
    }
    
    const updatedTransactions = activeProfile.data.transactions.filter(t => !transactionsToRemoveIds.includes(t.id));

    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
    if (validationError) {
        alert(validationError + "\nNo se puede eliminar esta transacción.");
        return;
    }
    
    updateActiveProfileData(data => ({
        ...data,
        transactions: updatedTransactions,
        assets: updatedAssets,
        loans: updatedLoans,
    }));
  }, [activeProfile]);

  const handleAddCategory = useCallback((name: string) => {
    const newCategory: Category = { id: crypto.randomUUID(), name, icon: 'Tag', color: '#64748b' };
    updateActiveProfileData(data => ({ ...data, categories: [...data.categories, newCategory] }));
  }, []);

  const handleUpdateCategory = useCallback((id: string, name: string) => {
    updateActiveProfileData(data => ({ ...data, categories: data.categories.map(cat => cat.id === id ? { ...cat, name } : cat) }));
  }, []);

  const handleDeleteCategory = useCallback((id: string) => {
    if (!activeProfile) return;
    if (activeProfile.data.transactions.some(t => t.categoryId === id)) {
      alert("No puedes eliminar una categoría que está siendo utilizada por algún gasto registrado.");
      return;
    }
    updateActiveProfileData(data => ({ ...data, categories: data.categories.filter(cat => cat.id !== id) }));
  }, [activeProfile]);

  const handleAddBankAccount = useCallback((name: string, color: string) => {
    const newBankAccount: BankAccount = { id: crypto.randomUUID(), name, color };
    updateActiveProfileData(data => ({ ...data, bankAccounts: [...data.bankAccounts, newBankAccount] }));
  }, []);

  const handleUpdateBankAccount = useCallback((id: string, name: string, color: string) => {
    updateActiveProfileData(data => ({ ...data, bankAccounts: data.bankAccounts.map(acc => acc.id === id ? { ...acc, name, color } : acc) }));
  }, []);

  const handleDeleteBankAccount = useCallback((id: string) => {
    if (!activeProfile) return;
    if (activeProfile.data.transactions.some(t => t.paymentMethodId === id)) {
      alert("No puedes eliminar un banco con transacciones asociadas. Primero, elimina o reasigna las transacciones.");
      return;
    }
    updateActiveProfileData(data => ({ ...data, bankAccounts: data.bankAccounts.filter(acc => acc.id !== id) }));
  }, [activeProfile]);

  const handleAddFixedExpense = useCallback((name: string, amount: number, categoryId?: string) => {
    const newFixedExpense: FixedExpense = { id: crypto.randomUUID(), name, amount, categoryId };
    updateActiveProfileData(data => ({ ...data, fixedExpenses: [...data.fixedExpenses, newFixedExpense] }));
  }, []);

  const handleDeleteFixedExpense = useCallback((id: string) => {
    updateActiveProfileData(data => ({ ...data, fixedExpenses: data.fixedExpenses.filter(expense => expense.id !== id) }));
  }, []);

  // FIX: Moved useMemo for balances before its use in handleCreateSaving
  const { balance, balancesByMethod } = useMemo(() => {
    if (!activeProfile) return { balance: 0, balancesByMethod: {} };

    const balances: Record<string, number> = {};
    activeProfile.data.bankAccounts.forEach(acc => balances[acc.id] = 0);
    balances[CASH_METHOD_ID] = 0;
    
    // Sort transactions chronologically to calculate balances correctly
    const sortedTransactions = [...activeProfile.data.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const t of sortedTransactions) {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances[t.paymentMethodId] = (balances[t.paymentMethodId] || 0) + amount;
    }
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
    return { balance: totalBalance, balancesByMethod: balances };
  }, [activeProfile]);

  const handleCreateSaving = useCallback((value: number, sourceMethodId: string, date: string) => {
    if (!activeProfile) return;

    const sourceBalance = balancesByMethod[sourceMethodId] || 0;
    if (value > sourceBalance) {
        alert("Fondos insuficientes en la cuenta de origen.");
        return;
    }

    const newAsset: Asset = { id: crypto.randomUUID(), name: 'Ahorro', value, date, sourceMethodId };
    const ahorroCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'ahorro');
    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: `Movimiento a Ahorros`,
        amount: value,
        date: date,
        type: 'expense',
        paymentMethodId: sourceMethodId,
        categoryId: ahorroCategory?.id,
        patrimonioId: newAsset.id,
        patrimonioType: 'asset',
    };
    
    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }

    updateActiveProfileData(data => ({
        ...data,
        assets: [...(data.assets || []), newAsset],
        transactions: updatedTransactions,
    }));

    setIsAssetLiabilityModalOpen(false);
  }, [activeProfile, balancesByMethod]);

  const handleSaveLiability = useCallback((name: string, amount: number, date: string) => {
    const newLiability: Liability = { id: crypto.randomUUID(), name, amount, date };
    updateActiveProfileData(data => ({ ...data, liabilities: [...(data.liabilities || []), newLiability] }));
    setIsAssetLiabilityModalOpen(false);
  }, []);

  const handleSaveLoan = useCallback((name: string, amount: number, sourceMethodId: string, date: string) => {
    if (!activeProfile) return;

    const sourceBalance = balancesByMethod[sourceMethodId] || 0;
    if (amount > sourceBalance) {
        alert("Fondos insuficientes en la cuenta de origen.");
        return;
    }

    const newLoan: Loan = { id: crypto.randomUUID(), name, amount, date, sourceMethodId };
    const prestamoCategory = activeProfile.data.categories.find(c => c.name.toLowerCase() === 'préstamos');
    
    const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: `Préstamo a ${name}`,
        amount: amount,
        date: date,
        type: 'expense',
        paymentMethodId: sourceMethodId,
        categoryId: prestamoCategory?.id,
        patrimonioId: newLoan.id,
        patrimonioType: 'loan',
    };
    
    const updatedTransactions = [newTransaction, ...activeProfile.data.transactions];
    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);

    if (validationError) {
        alert(validationError);
        return;
    }

    updateActiveProfileData(data => ({
        ...data,
        loans: [...(data.loans || []), newLoan],
        transactions: updatedTransactions,
    }));

    setIsAssetLiabilityModalOpen(false);
  }, [activeProfile, balancesByMethod]);

  const handleDeleteAsset = useCallback((id: string) => {
    if (!activeProfile) return;

    const updatedTransactions = activeProfile.data.transactions.filter(
        t => !(t.patrimonioId === id && t.patrimonioType === 'asset')
    );
    const updatedAssets = (activeProfile.data.assets || []).filter(item => item.id !== id);

    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
    if (validationError) {
        alert(validationError + "\nNo se puede eliminar este ahorro.");
        return;
    }

    updateActiveProfileData(data => ({
        ...data,
        assets: updatedAssets,
        transactions: updatedTransactions,
    }));
  }, [activeProfile]);

  const handleDeleteLiability = useCallback((id: string) => {
      updateActiveProfileData(data => ({ ...data, liabilities: (data.liabilities || []).filter(item => item.id !== id) }));
  }, []);

  const handleDeleteLoan = useCallback((id: string) => {
    if (!activeProfile) return;

    const updatedTransactions = activeProfile.data.transactions.filter(
        t => !(t.patrimonioId === id && t.patrimonioType === 'loan')
    );
    const updatedLoans = (activeProfile.data.loans || []).filter(item => item.id !== id);

    const validationError = validateTransactionChange(updatedTransactions, activeProfile.data.bankAccounts);
    if (validationError) {
        alert(validationError + "\nNo se puede eliminar este préstamo.");
        return;
    }

    updateActiveProfileData(data => ({
        ...data,
        loans: updatedLoans,
        transactions: updatedTransactions,
    }));
  }, [activeProfile]);

  const summaryData = useMemo(() => {
    if (!activeProfile) {
        return {
            monthlyIncome: 0, monthlyExpenses: 0,
            monthlyIncomeByBank: 0, monthlyIncomeByCash: 0,
            monthlyExpensesByBank: 0, monthlyExpensesByCash: 0,
            totalIncome: 0, totalExpenses: 0
        };
    }
    const { transactions, categories } = activeProfile.data;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const ahorroCategoryId = categories.find(c => c.name.toLowerCase() === 'ahorro')?.id;

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const monthlyIncomeByMethod: Record<string, number> = {};
    const monthlyExpensesByMethod: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        // Exclude transfers and savings from summary calculations for clarity
        if (t.transferId || t.categoryId === ahorroCategoryId) return;

        // Monthly calculation
        const transactionDate = new Date(t.date);
        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
            if (t.type === 'income') {
                monthlyIncome += t.amount;
                monthlyIncomeByMethod[t.paymentMethodId] = (monthlyIncomeByMethod[t.paymentMethodId] || 0) + t.amount;
            } else {
                monthlyExpenses += t.amount;
                monthlyExpensesByMethod[t.paymentMethodId] = (monthlyExpensesByMethod[t.paymentMethodId] || 0) + t.amount;
            }
        }
        
        // Total calculation
        if (t.type === 'income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
        }
    });
      
    const monthlyIncomeByCash = monthlyIncomeByMethod[CASH_METHOD_ID] || 0;
    const monthlyIncomeByBank = Object.entries(monthlyIncomeByMethod)
        .filter(([id]) => id !== CASH_METHOD_ID)
        .reduce((sum, [, amount]) => sum + amount, 0);

    const monthlyExpensesByCash = monthlyExpensesByMethod[CASH_METHOD_ID] || 0;
    const monthlyExpensesByBank = Object.entries(monthlyExpensesByMethod)
        .filter(([id]) => id !== CASH_METHOD_ID)
        .reduce((sum, [, amount]) => sum + amount, 0);

    return {
        monthlyIncome,
        monthlyExpenses,
        monthlyIncomeByBank,
        monthlyIncomeByCash,
        monthlyExpensesByBank,
        monthlyExpensesByCash,
        totalIncome,
        totalExpenses,
    };
  }, [activeProfile]);

  const { manualAssetsValue, totalLiabilities, totalLoans } = useMemo(() => {
    if (!activeProfile) return { manualAssetsValue: 0, totalLiabilities: 0, totalLoans: 0 };
    const manualAssetsValue = activeProfile.data.assets?.reduce((sum, asset) => sum + asset.value, 0) || 0;
    const totalLiabilities = activeProfile.data.liabilities?.reduce((sum, liability) => sum + liability.amount, 0) || 0;
    const totalLoans = activeProfile.data.loans?.reduce((sum, loan) => sum + loan.amount, 0) || 0;
    return { manualAssetsValue, totalLiabilities, totalLoans };
  }, [activeProfile]);
  
  const handleExportData = useCallback(() => {
    if (!activeProfile) {
      alert("No hay un perfil activo para exportar.");
      return;
    }

    try {
      const exportPayload = {
        profile: activeProfile,
        summary: {
            balance,
            cashBalance: balancesByMethod[CASH_METHOD_ID] || 0,
            monthlyIncome: summaryData.monthlyIncome,
            monthlyExpenses: summaryData.monthlyExpenses,
            totalIncome: summaryData.totalIncome,
            totalExpenses: summaryData.totalExpenses
        },
        balancesByMethod
      };

      const csvData = exportProfileToCsv(exportPayload);
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      const safeProfileName = activeProfile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `exportacion_${safeProfileName}_${dateStr}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar los datos:", error);
      alert("Ocurrió un error al intentar exportar los datos. Por favor, inténtalo de nuevo.");
    }
  }, [activeProfile, balance, balancesByMethod, summaryData]);

  const handleExportAllDataToJson = useCallback(() => {
    try {
      const allData = {
        profiles: profiles,
        activeProfileId: activeProfileId,
        theme: theme,
      };
  
      const jsonString = JSON.stringify(allData, null, 2); // Pretty print for readability
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      const dateStr = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `income_tracker_backup_${dateStr}.json`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar los datos a JSON:", error);
      alert("Ocurrió un error al intentar exportar los datos. Por favor, inténtalo de nuevo.");
    }
  }, [profiles, activeProfileId, theme]);

  const handleImportDataFromJson = useCallback((file: File) => {
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== 'string') {
        alert("Error al leer el archivo.");
        return;
      }
      
      if (!window.confirm("¿Estás seguro de que quieres importar estos datos? Se sobrescribirán todos los datos actuales. Esta acción no se puede deshacer.")) {
        return;
      }

      try {
        const data = JSON.parse(result);
        
        // Basic validation
        if (!data.profiles || !Array.isArray(data.profiles) || typeof data.theme !== 'string') {
            throw new Error("El archivo JSON no tiene el formato correcto.");
        }
        
        // Data migration for older backups without new fields
        const migratedProfiles = data.profiles.map((p: Profile) => ({
            ...p,
            data: {
                ...p.data,
                assets: p.data.assets || [],
                liabilities: p.data.liabilities || [],
                loans: p.data.loans || [],
            }
        }));

        setProfiles(migratedProfiles);
        setActiveProfileId(data.activeProfileId);
        setTheme(data.theme);
        
        // We must reload to ensure all state is correctly re-initialized from localStorage
        window.location.reload();

      } catch (error) {
        console.error("Error al importar datos JSON:", error);
        alert("Error: El archivo seleccionado no es un archivo de respaldo válido.");
      }
    };
    reader.readAsText(file);
  }, []);

  const minDateForExpenses = useMemo(() => {
    if (!activeProfile) return undefined;
    const firstIncomeDate = findFirstIncomeDate(activeProfile.data.transactions);
    return firstIncomeDate ? firstIncomeDate.toISOString().split('T')[0] : undefined;
  }, [activeProfile]);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
    if (page === 'inicio') {
        setActiveProfileId(null);
    }
  }, []);

  const handleInitiateTransfer = useCallback((direction: 'deposit' | 'withdrawal') => {
    setTransferDirection(direction);
    setIsTransferModalOpen(true);
  }, []);
  
  const handleSelectProfile = useCallback((profileId: string) => {
    setActiveProfileId(profileId);
    setCurrentPage('resumen');
  }, []);
  
  const handleAddProfile = useCallback((name: string, countryCode: string, currency: string) => {
    const newProfile: Profile = {
        id: crypto.randomUUID(),
        name,
        countryCode,
        currency,
        data: createDefaultProfileData(),
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    setIsProfileCreationModalOpen(false);
    setCurrentPage('resumen');
  }, []);

  const handleDeleteProfile = useCallback((profileId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este perfil y todos sus datos? Esta acción no se puede deshacer.")) {
        return;
    }

    setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));

    if (activeProfileId === profileId) {
        setActiveProfileId(null);
        setCurrentPage('inicio');
    }
  }, [activeProfileId]);
  
  const openAssetLiabilityModal = (type: 'asset' | 'liability' | 'loan') => {
    setModalConfig({ type });
    setIsAssetLiabilityModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 transition-colors duration-500 font-sans">
      {currentPage === 'inicio' || !activeProfile ? (
        <Inicio 
          profiles={profiles}
          onSelectProfile={handleSelectProfile}
          onAddProfile={() => setIsProfileCreationModalOpen(true)}
          onDeleteProfile={handleDeleteProfile}
        />
      ) : (
        <>
          <main className="container mx-auto p-4 md:p-8 max-w-3xl pb-20">
            {currentPage === 'resumen' && (
              <Resumen
                profile={activeProfile}
                balance={balance} 
                balancesByMethod={balancesByMethod}
                onDeleteTransaction={handleDeleteTransaction}
                onUpdateTransaction={handleUpdateTransaction}
                onInitiateDeposit={() => handleInitiateTransfer('deposit')}
                onInitiateWithdrawal={() => handleInitiateTransfer('withdrawal')}
                monthlyIncome={summaryData.monthlyIncome}
                monthlyExpenses={summaryData.monthlyExpenses}
                monthlyIncomeByBank={summaryData.monthlyIncomeByBank}
                monthlyIncomeByCash={summaryData.monthlyIncomeByCash}
                monthlyExpensesByBank={summaryData.monthlyExpensesByBank}
                monthlyExpensesByCash={summaryData.monthlyExpensesByCash}
                totalIncome={summaryData.totalIncome}
                totalExpenses={summaryData.totalExpenses}
              />
            )}
            {currentPage === 'ajustes' && (
              <Ajustes 
                theme={theme} 
                onToggleTheme={handleToggleTheme}
                categories={activeProfile.data.categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                bankAccounts={activeProfile.data.bankAccounts}
                onAddBankAccount={handleAddBankAccount}
                onUpdateBankAccount={handleUpdateBankAccount}
                onDeleteBankAccount={handleDeleteBankAccount}
                onExportData={handleExportData}
                onExportAllDataToJson={handleExportAllDataToJson}
                onImportDataFromJson={handleImportDataFromJson}
                onManageFixedExpenses={() => setIsFixedExpenseModalOpen(true)}
              />
            )}
            {currentPage === 'ingresos' && (
              <Ingresos
                profile={activeProfile}
                balance={balance}
                balancesByMethod={balancesByMethod}
                onAddTransaction={handleAddTransaction} 
                onNavigate={handleNavigate}
                onAddBankAccount={handleAddBankAccount}
                onUpdateBankAccount={handleUpdateBankAccount}
                onDeleteBankAccount={handleDeleteBankAccount}
                onInitiateDeposit={() => handleInitiateTransfer('deposit')}
                onInitiateWithdrawal={() => handleInitiateTransfer('withdrawal')}
              />
            )}
            {currentPage === 'gastos' && (
              <Gastos
                profile={activeProfile}
                balance={balance}
                balancesByMethod={balancesByMethod}
                onAddTransaction={handleAddTransaction} 
                onNavigate={handleNavigate}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddBankAccount={handleAddBankAccount}
                onUpdateBankAccount={handleUpdateBankAccount}
                onDeleteBankAccount={handleDeleteBankAccount}
                onAddFixedExpense={handleAddFixedExpense}
                onDeleteFixedExpense={handleDeleteFixedExpense}
                minDateForExpenses={minDateForExpenses}
                onInitiateDeposit={() => handleInitiateTransfer('deposit')}
                onInitiateWithdrawal={() => handleInitiateTransfer('withdrawal')}
              />
            )}
            {currentPage === 'patrimonio' && (
                <Patrimonio
                    profile={activeProfile}
                    manualAssetsValue={manualAssetsValue}
                    totalLiabilities={totalLiabilities}
                    totalLoans={totalLoans}
                    assets={activeProfile.data.assets || []}
                    liabilities={activeProfile.data.liabilities || []}
                    loans={activeProfile.data.loans || []}
                    bankAccounts={activeProfile.data.bankAccounts || []}
                    onDeleteAsset={handleDeleteAsset}
                    onDeleteLiability={handleDeleteLiability}
                    onDeleteLoan={handleDeleteLoan}
                />
            )}
          </main>
          
          {currentPage === 'resumen' && (
            <FloatingActionButton
              buttonClass="bg-gradient-to-br from-[#008f39] to-green-400"
              ringColorClass="focus:ring-[#008f39]/50"
              position={fabPosition}
              onPositionChange={setFabPosition}
              menuItems={[
                {
                  label: 'Añadir Ingreso',
                  icon: <ArrowUpIcon className="w-6 h-6" />,
                  onClick: () => handleNavigate('ingresos'),
                  color: '#008f39',
                },
                {
                  label: 'Añadir Gasto',
                  icon: <ArrowDownIcon className="w-6 h-6" />,
                  onClick: () => handleNavigate('gastos'),
                  color: '#ef4444',
                },
              ]}
            />
          )}

          {currentPage === 'patrimonio' && (
            <FloatingActionButton
              buttonClass="bg-gradient-to-br from-blue-500 to-cyan-400"
              ringColorClass="focus:ring-blue-500/50"
              position={fabPosition}
              onPositionChange={setFabPosition}
              menuItems={[
                {
                    label: 'Añadir Ahorro',
                    icon: <ArrowUpIcon className="w-6 h-6" />,
                    onClick: () => openAssetLiabilityModal('asset'),
                    color: '#22c55e',
                    disabled: balance <= 0
                },
                {
                    label: 'Añadir Préstamo',
                    icon: <ScaleIcon className="w-6 h-6" />,
                    onClick: () => openAssetLiabilityModal('loan'),
                    color: '#3b82f6',
                    disabled: balance <= 0
                },
                {
                    label: 'Añadir Deuda',
                    icon: <ArrowDownIcon className="w-6 h-6" />,
                    onClick: () => openAssetLiabilityModal('liability'),
                    color: '#ef4444'
                },
              ]}
            />
          )}

          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        </>
      )}
      {activeProfile && <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => {
            setIsTransferModalOpen(false);
            setTransferDirection(null);
        }}
        balancesByMethod={balancesByMethod}
        bankAccounts={activeProfile.data.bankAccounts}
        transactions={activeProfile.data.transactions}
        onAddTransfer={handleAddTransfer}
        initialDirection={transferDirection}
        currency={activeProfile.currency}
      />}
      <ProfileCreationModal 
        isOpen={isProfileCreationModalOpen}
        onClose={() => setIsProfileCreationModalOpen(false)}
        onAddProfile={handleAddProfile}
      />
      {activeProfile && <FixedExpenseModal
        isOpen={isFixedExpenseModalOpen}
        onClose={() => setIsFixedExpenseModalOpen(false)}
        fixedExpenses={activeProfile.data.fixedExpenses}
        categories={activeProfile.data.categories}
        onAddFixedExpense={handleAddFixedExpense}
        onDeleteFixedExpense={handleDeleteFixedExpense}
        currency={activeProfile.currency}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />}
      {modalConfig && activeProfile && <AssetLiabilityModal
        isOpen={isAssetLiabilityModalOpen}
        onClose={() => setIsAssetLiabilityModalOpen(false)}
        onSaveLiability={handleSaveLiability}
        onSaveLoan={handleSaveLoan}
        onCreateSaving={handleCreateSaving}
        config={modalConfig}
        currency={activeProfile.currency}
        bankAccounts={activeProfile.data.bankAccounts}
        balancesByMethod={balancesByMethod}
      />}
    </div>
  );
};

export default App;