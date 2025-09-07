import React, { useState, useRef } from 'react';
import { Page, Profile } from '../types';
import TransactionForm from '../components/TransactionForm';
import Summary from '../components/Summary';
import BankAccountModal from '../components/BankAccountModal';
import BankSelectionModal from '../components/BankSelectionModal';
import BankIcon from '../components/icons/BankIcon';

const CASH_METHOD_ID = 'efectivo';

interface IngresosProps {
  profile: Profile;
  balance: number;
  balancesByMethod: Record<string, number>;
  onAddTransaction: (description: string, amount: number, date: string, type: 'income' | 'expense', paymentMethodId: string, categoryId?: string) => void;
  onNavigate: (page: Page) => void;
  onAddBankAccount: (name: string, color: string) => void;
  onUpdateBankAccount: (id: string, name: string, color: string) => void;
  onDeleteBankAccount: (id: string) => void;
  onInitiateDeposit: () => void;
  onInitiateWithdrawal: () => void;
}

const Ingresos: React.FC<IngresosProps> = ({ 
  profile, balance, balancesByMethod, onAddTransaction,
  onAddBankAccount, onUpdateBankAccount, onDeleteBankAccount,
  onInitiateDeposit, onInitiateWithdrawal
}) => {
  // FIX: Destructure bankAccounts from profile.data
  const { data: { bankAccounts }, currency } = profile;
  const [activeMethodId, setActiveMethodId] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isBankSelectionModalOpen, setIsBankSelectionModalOpen] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectMethod = (id: string) => {
    setActiveMethodId(id);
    setIsFormVisible(true);
  };

  const getButtonClass = (isActive: boolean) => {
    const baseClasses = 'w-full flex items-center justify-center gap-2 p-3 font-semibold text-center rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900';
    if (isActive) {
        return `${baseClasses} text-white shadow-md`;
    }
    return `${baseClasses} bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`;
  };

  const selectedBank = bankAccounts.find(b => b.id === activeMethodId);

  const handleBankSelect = (bankId: string) => {
    handleSelectMethod(bankId);
    setIsBankSelectionModalOpen(false);
  };

  const handleFormSubmit = (description: string, amount: number, date: string) => {
    if (activeMethodId) {
      onAddTransaction(description, amount, date, 'income', activeMethodId);
      setIsFormVisible(false);
    }
  };

  const handleAnimationEnd = () => {
    if (!isFormVisible) {
        setActiveMethodId(null);
    }
  };

  return (
    <>
      <div className="relative animate-fade-in">
        {/* The Glow Effect */}
        <div className="absolute -inset-2 bg-gradient-to-br from-[#008f39] to-green-400 rounded-2xl blur-xl animate-glow opacity-50"></div>
        
        {/* The Content Card */}
        <div className="relative p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex justify-center items-center mb-6">
            <h2 className="text-2xl font-bold text-[#008f39] dark:text-[#008f39]">
              Añadir Ingresos
            </h2>
          </div>

          <div className="mb-8">
            <Summary 
              balance={balance} 
              balancesByMethod={balancesByMethod}
              onCashClick={onInitiateDeposit}
              onBankClick={onInitiateWithdrawal}
              currency={currency}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">1. Selecciona un método:</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIsBankSelectionModalOpen(true)}
                  className={getButtonClass(!!selectedBank)}
                  style={selectedBank ? { backgroundColor: selectedBank.color, color: 'white', borderColor: 'transparent', '--tw-ring-color': selectedBank.color } as React.CSSProperties : {}}
                >
                  <BankIcon className="w-5 h-5" />
                  {selectedBank ? selectedBank.name : 'Banco / Tarjeta'}
                </button>
                <button
                  onClick={() => handleSelectMethod(CASH_METHOD_ID)}
                  className={`${getButtonClass(activeMethodId === CASH_METHOD_ID)}`}
                  style={activeMethodId === CASH_METHOD_ID ? { backgroundColor: '#008f39', '--tw-ring-color': '#008f39' } as React.CSSProperties : {}}
                >
                  Efectivo
                </button>
              </div>
            </div>

            <div 
              className={`transition-all duration-700 ease-in-out overflow-hidden ${isFormVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
              ref={formContainerRef}
              onTransitionEnd={handleAnimationEnd}
            >
              {activeMethodId && (
                <TransactionForm
                  key={activeMethodId}
                  transactionType="income"
                  onAddTransaction={handleFormSubmit}
                  currency={currency}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <BankAccountModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
        bankAccounts={bankAccounts}
        onAddBankAccount={onAddBankAccount}
        onUpdateBankAccount={onUpdateBankAccount}
        onDeleteBankAccount={onDeleteBankAccount}
      />
      <BankSelectionModal
        isOpen={isBankSelectionModalOpen}
        onClose={() => setIsBankSelectionModalOpen(false)}
        bankAccounts={bankAccounts}
        balancesByMethod={balancesByMethod}
        onSelect={handleBankSelect}
        onManageBanks={() => {
          setIsBankSelectionModalOpen(false);
          setIsBankModalOpen(true);
        }}
        mode="income"
        currency={currency}
      />
    </>
  );
};

export default Ingresos;