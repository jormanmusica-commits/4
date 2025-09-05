import { Profile } from '../types';

const CASH_METHOD_ID = 'efectivo';

// Sanitize and quote a field for CSV, also removing accents.
const sanitizeCsvField = (field: any): string => {
  if (field === null || field === undefined) {
    return '""';
  }
  let str = String(field);
  // Normalize to remove accents
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Escape any existing double quotes by doubling them up and wrap in quotes.
  return `"${str.replace(/"/g, '""')}"`;
};

// Create a CSV row from an array of values.
const toCsvRow = (arr: any[]): string => arr.map(sanitizeCsvField).join(',') + '\r\n';

interface ExportSummary {
  balance: number;
  cashBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalExpenses: number;
}

interface ExportPayload {
  profile: Profile;
  summary: ExportSummary;
  balancesByMethod: Record<string, number>;
}

export const exportProfileToCsv = (payload: ExportPayload): string => {
  const { profile, summary, balancesByMethod } = payload;
  let csvContent = '';

  const formatAmount = (amount: number) => {
    // Use a period as a decimal separator for CSV compatibility
    return amount.toFixed(2);
  }

  // Section 1: Profile Info
  csvContent += 'Informacion del Pais\r\n';
  csvContent += toCsvRow(['Nombre del Pais', profile.name]);
  csvContent += toCsvRow(['Fecha de Exportacion', new Date().toISOString().split('T')[0]]);
  csvContent += '\r\n\r\n';

  // Section 2: Saldo Actual
  const bankBalance = Object.entries(balancesByMethod)
    .filter(([id]) => id !== CASH_METHOD_ID)
    .reduce((sum, [, amount]) => sum + amount, 0);

  csvContent += 'Saldo Actual\r\n';
  csvContent += toCsvRow(['Saldo Total', formatAmount(summary.balance)]);
  csvContent += toCsvRow(['Saldo en Efectivo', formatAmount(summary.cashBalance)]);
  csvContent += toCsvRow(['Saldo en Banco/Tarjeta', formatAmount(bankBalance)]);
  csvContent += '\r\n\r\n';

  // Section 3: Ingresos Mensuales
  csvContent += 'Ingresos Mensuales\r\n';
  csvContent += toCsvRow(['Ingresos (Este Mes)', formatAmount(summary.monthlyIncome)]);
  csvContent += '\r\n\r\n';
  
  // Section 4: Gastos Mensuales
  csvContent += 'Gastos Mensuales\r\n';
  csvContent += toCsvRow(['Gastos (Este Mes)', formatAmount(summary.monthlyExpenses)]);
  csvContent += '\r\n\r\n';
  
  // Section 5: Resumen Global de Ingresos
  csvContent += 'Resumen Global de Ingresos\r\n';
  csvContent += toCsvRow(['Ingresos (Total)', formatAmount(summary.totalIncome)]);
  csvContent += '\r\n\r\n';

  // Section 6: Resumen Global de Gastos
  csvContent += 'Resumen Global de Gastos\r\n';
  csvContent += toCsvRow(['Gastos (Total)', formatAmount(summary.totalExpenses)]);
  csvContent += '\r\n\r\n';

  const { transactions, bankAccounts, fixedExpenses } = profile.data;
  
  // Section 7: Cuentas Bancarias
  csvContent += 'Cuentas Bancarias\r\n';
  csvContent += toCsvRow(['Nombre', 'Saldo Actual']);
  bankAccounts.forEach(acc => {
    const balance = balancesByMethod[acc.id] || 0;
    csvContent += toCsvRow([acc.name, formatAmount(balance)]);
  });
  csvContent += '\r\n\r\n';

  // Section 8: Fixed Expenses
  csvContent += 'Gastos Fijos\r\n';
  csvContent += toCsvRow(['Nombre', 'Cantidad']);
  fixedExpenses.forEach(fe => {
    csvContent += toCsvRow([fe.name, formatAmount(fe.amount)]);
  });
  csvContent += '\r\n\r\n';

  // Section 9: Transactions
  csvContent += 'Transacciones\r\n';
  csvContent += toCsvRow(['Fecha', 'Descripcion', 'Cantidad', 'Tipo', 'Metodo de Pago']);
  const bankAccountMap = new Map(bankAccounts.map(b => [b.id, b.name]));
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  sortedTransactions.forEach(t => {
    const type = t.type === 'income' ? 'Ingreso' : 'Gasto';
    const amount = t.amount;
    
    let paymentMethodName = 'Desconocido';
    if (t.paymentMethodId === CASH_METHOD_ID) {
      paymentMethodName = 'Efectivo';
    } else {
      paymentMethodName = bankAccountMap.get(t.paymentMethodId) || 'Cuenta Eliminada';
    }

    csvContent += toCsvRow([
      t.date,
      t.description,
      formatAmount(amount),
      type,
      paymentMethodName,
    ]);
  });

  return csvContent;
};
