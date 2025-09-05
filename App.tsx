import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Theme, Transaction, Page, Category, BankAccount, FixedExpense, Profile, ProfileData, Asset, Liability } from './types';
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


const CASH_METHOD_ID = 'efectivo';

const defaultCategories: Category[] = [
  { id: '1', name: 'Comida', icon: 'Food', color: '#008f39' },
  { id: '2', name: 'Transporte', icon: 'Transport', color: '#3b82f6' },
  { id: '3', name: 'Ropa', icon: 'Clothing', color: '#ec4899' },
  { id: '4', name: 'Hogar', icon: 'House', color: '#f97316' },
  { id: '5', name: 'Entretenimiento', icon: 'Entertainment', color: '#8b5cf6' },
  { id: '6', name: 'Salud', icon: 'Health', color: '#ef4444' },
  { id: '8', name: 'Ahorro', icon: 'Tag', color: '#14b8a6' },
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
});

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
                assets: [], liabilities: [] 
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
  const [modalConfig, setModalConfig] = useState<{ type: 'asset' | 'liability', item?: Asset | Liability } | null>(null);

  const activeProfile = useMemo(() => profiles.find(p => p.id === activeProfileId), [profiles, activeProfileId]);

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
        p.id === activeProfileId ? { ...p, data: { ...p.data, ...updater(p.data) } } : p
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

  const handleDeleteTransaction = useCallback((id: string) => {
    if (!activeProfile) return;

    const transactionToDelete = activeProfile.data.transactions.find(t => t.id === id);
    if (!transactionToDelete) return;

    let transactionsToRemoveIds = [id];

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

    updateActiveProfileData(data => ({ ...data, transactions: updatedTransactions }));
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

  const handleSaveAsset = useCallback((name: string, value: number, id?: string) => {
    if(id) { // Update
        updateActiveProfileData(data => ({ ...data, assets: data.assets.map(a => a.id === id ? {...a, name, value} : a) }));
    } else { // Add
        const newAsset: Asset = { id: crypto.randomUUID(), name, value };
        updateActiveProfileData(data => ({ ...data, assets: [...(data.assets || []), newAsset] }));
    }
    setIsAssetLiabilityModalOpen(false);
  }, []);

  const handleDeleteAsset = useCallback((id: string) => {
    updateActiveProfileData(data => ({...data, assets: data.assets.filter(a => a.id !== id)}));
  }, []);

  const handleSaveLiability = useCallback((name: string, amount: number, id?: string) => {
    if(id) { // Update
        updateActiveProfileData(data => ({ ...data, liabilities: data.liabilities.map(l => l.id === id ? {...l, name, amount} : l) }));
    } else { // Add
        const newLiability: Liability = { id: crypto.randomUUID(), name, amount };
        updateActiveProfileData(data => ({ ...data, liabilities: [...(data.liabilities || []), newLiability] }));
    }
    setIsAssetLiabilityModalOpen(false);
  }, []);

  const handleDeleteLiability = useCallback((id: string) => {
    updateActiveProfileData(data => ({...data, liabilities: data.liabilities.filter(l => l.id !== id)}));
  }, []);

  const { balance, balancesByMethod } = useMemo(() => {
    if (!activeProfile) return { balance: 0, balancesByMethod: {} };

    const balances: Record<string, number> = {};
    for (const t of activeProfile.data.transactions) {
      const amount = t.type === 'income' ? t.amount : -t.amount;
      balances[t.paymentMethodId] = (balances[t.paymentMethodId] || 0) + amount;
    }
    const totalBalance = Object.values(balances).reduce((sum, b) => sum + b, 0);
    return { balance: totalBalance, balancesByMethod: balances };
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
    const { transactions } = activeProfile.data;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    const monthlyIncomeByMethod: Record<string, number> = {};
    const monthlyExpensesByMethod: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
        // Exclude transfers from all summary calculations
        if (t.transferId) return;

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

  const { totalAssets, totalLiabilities, netWorth } = useMemo(() => {
    if (!activeProfile) return { totalAssets: 0, totalLiabilities: 0, netWorth: 0 };
    const otherAssetsValue = activeProfile.data.assets?.reduce((sum, asset) => sum + asset.value, 0) || 0;
    const totalAssets = balance + otherAssetsValue;
    const totalLiabilities = activeProfile.data.liabilities?.reduce((sum, liability) => sum + liability.amount, 0) || 0;
    const netWorth = totalAssets - totalLiabilities;
    return { totalAssets, totalLiabilities, netWorth };
  }, [activeProfile, balance]);
  
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
  
  const openAssetLiabilityModal = (type: 'asset' | 'liability', item?: Asset | Liability) => {
    setModalConfig({ type, item });
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
                    balance={balance}
                    totalAssets={totalAssets}
                    totalLiabilities={totalLiabilities}
                    netWorth={netWorth}
                    onAddAsset={() => openAssetLiabilityModal('asset')}
                    onEditAsset={(asset) => openAssetLiabilityModal('asset', asset)}
                    onDeleteAsset={handleDeleteAsset}
                    onAddLiability={() => openAssetLiabilityModal('liability')}
                    onEditLiability={(liability) => openAssetLiabilityModal('liability', liability)}
                    onDeleteLiability={handleDeleteLiability}
                />
            )}
          </main>
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
      {modalConfig && <AssetLiabilityModal
        isOpen={isAssetLiabilityModalOpen}
        onClose={() => setIsAssetLiabilityModalOpen(false)}
        onSaveAsset={handleSaveAsset}
        onSaveLiability={handleSaveLiability}
        config={modalConfig}
        currency={activeProfile.currency}
      />}
    </div>
  );
};

export default App;