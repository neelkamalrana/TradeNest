import React from 'react';

const RecentTransactions = ({ currentAccount }) => {
  if (!currentAccount?.transactions || currentAccount.transactions.length === 0) {
    return null;
  }

  return (
    <div className="mt-10">
      <h4 className="text-xl font-bold text-white mb-5">Recent Transactions</h4>
      <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Symbol</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Quantity</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Total</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">P/L</th>
              </tr>
            </thead>
            <tbody>
              {currentAccount.transactions.slice(0, 5).map((transaction) => (
                <tr key={transaction.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 text-slate-300">{transaction.date}</td>
                  <td className={`px-4 py-3 font-semibold ${
                    transaction.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{transaction.symbol}</td>
                  <td className="px-4 py-3 text-slate-300">{transaction.quantity}</td>
                  <td className="px-4 py-3 text-slate-300">${transaction.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-300">${transaction.total.toFixed(2)}</td>
                  <td className={`px-4 py-3 ${
                    transaction.profitLoss !== undefined 
                      ? (transaction.profitLoss >= 0 ? 'text-green-400' : 'text-red-400')
                      : 'text-slate-500'
                  }`}>
                    {transaction.profitLoss !== undefined 
                      ? `${transaction.profitLoss >= 0 ? '+' : ''}$${transaction.profitLoss.toFixed(2)}`
                      : '-'
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentTransactions;

