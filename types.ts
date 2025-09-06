export interface BankAccount {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  paymentMethodId: string;
  categoryId?: string;
  transferId?: string;
  patrimonioId?: string;
  patrimonioType?: 'asset' | 'loan';
}

export interface Category {
  id:string;
  name: string;
  icon: string;
  color: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  categoryId?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  date: string;
  sourceMethodId?: string;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  date: string;
}

export interface Loan {
  id: string;
  name: string;
  amount: number;
  date: string;
  sourceMethodId?: string;
}

export interface ProfileData {
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  categories: Category[];
  fixedExpenses: FixedExpense[];
  assets: Asset[];
  liabilities: Liability[];
  loans: Loan[];
}

export interface Profile {
  id: string;
  name: string;
  countryCode: string; // e.g., 'ES'
  currency: string; // e.g., 'EUR'
  data: ProfileData;
}


export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

export type Page = 'inicio' | 'resumen' | 'ajustes' | 'ingresos' | 'gastos' | 'patrimonio';

export type TransactionTypeFilter = 'income' | 'expense' | 'transfer' | 'saving' | 'loan';
export type PaymentMethodFilter = 'cash' | 'bank';

export interface Filters {
  startDate: string;
  endDate: string;
  types: TransactionTypeFilter[];
  methods: PaymentMethodFilter[];
  bankAccounts: string[];
}

export interface PatrimonioFilters {
  types: ('asset' | 'loan' | 'liability')[];
  sources: string[];
}