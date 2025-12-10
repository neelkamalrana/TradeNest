import React, { useState, useEffect } from 'react';

const Statements = ({ currentAccount }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  // Set default date range (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  // Generate statements when filters change
  useEffect(() => {
    if (startDate && endDate && currentAccount) {
      generateStatements();
    }
  }, [startDate, endDate, currentAccount]);

  const generateStatements = () => {
    const statements = [];
    
    // Return early if no account or transactions
    if (!currentAccount || !currentAccount.transactions || currentAccount.transactions.length === 0) {
      setFilteredData([]);
      return;
    }
    
    const account = currentAccount;
    if (!account.transactions || account.transactions.length === 0) return;

        // Filter transactions by date range
        const dateFilteredTransactions = account.transactions.filter(transaction => {
          // Parse transaction date - format is "DD/MM/YYYY, HH:MM am/pm" (en-IN locale)
          let transactionDate;
          try {
            const dateStr = transaction.date;
            
            // Handle format like "07/12/2025, 07:02 am" or "7/12/2025, 7:02 am"
            const parts = dateStr.split(',');
            if (parts.length > 0) {
              const datePart = parts[0].trim(); // "07/12/2025" or "7/12/2025"
              const dateComponents = datePart.split('/');
              
              if (dateComponents.length === 3) {
                // Format is DD/MM/YYYY (en-IN format)
                const day = dateComponents[0].padStart(2, '0');
                const month = dateComponents[1].padStart(2, '0');
                const year = dateComponents[2];
                // Create date in YYYY-MM-DD format for proper parsing
                transactionDate = new Date(`${year}-${month}-${day}T00:00:00`);
              } else {
                transactionDate = new Date(transaction.date);
              }
            } else {
              transactionDate = new Date(transaction.date);
            }
            
            // Validate the parsed date
            if (isNaN(transactionDate.getTime())) {
              console.warn('Failed to parse transaction date:', transaction.date);
              return false; // Skip invalid dates
            }
          } catch (e) {
            console.error('Error parsing date:', e, transaction.date);
            return false; // Skip invalid dates
          }
          
          // Parse filter dates
          const start = new Date(startDate + 'T00:00:00');
          const end = new Date(endDate + 'T23:59:59');
          
          // Set times to ensure proper comparison
          transactionDate.setHours(0, 0, 0, 0);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          
          return transactionDate >= start && transactionDate <= end;
        });

        if (dateFilteredTransactions.length === 0) return;

        // Group by stock symbol
        const stockWiseData = {};
        
        dateFilteredTransactions.forEach(transaction => {
          const symbol = transaction.symbol;
          
          if (!stockWiseData[symbol]) {
            stockWiseData[symbol] = {
              symbol: symbol,
              buyCount: 0,
              buyQuantity: 0,
              buyTotal: 0,
              sellCount: 0,
              sellQuantity: 0,
              sellTotal: 0,
              totalProfitLoss: 0
            };
          }

          if (transaction.type === 'BUY') {
            stockWiseData[symbol].buyCount++;
            stockWiseData[symbol].buyQuantity += transaction.quantity;
            stockWiseData[symbol].buyTotal += transaction.total;
          } else if (transaction.type === 'SELL') {
            stockWiseData[symbol].sellCount++;
            stockWiseData[symbol].sellQuantity += transaction.quantity;
            stockWiseData[symbol].sellTotal += transaction.total;
            if (transaction.profitLoss) {
              stockWiseData[symbol].totalProfitLoss += transaction.profitLoss;
            }
          }
        });

    // Convert to array
    Object.values(stockWiseData).forEach(stockData => {
      statements.push({
        ...stockData
      });
    });

    setFilteredData(statements);
  };

  return (
    <div>
      <h4 className="text-xl font-bold text-white mb-5">Statements</h4>
      
      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-300 text-sm">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full px-3 py-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <div className="text-red-400 text-sm mt-3 bg-red-900/20 border border-red-800 rounded-lg p-3">
            Start date cannot be after end date
          </div>
        )}
      </div>

      {/* Statements Table */}
      {filteredData.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-10 text-center text-slate-400">
          {startDate && endDate 
            ? 'No transactions found for the selected date range and filters.'
            : 'Please select a date range to view statements.'
          }
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Buy Count</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Buy Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Buy Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Sell Count</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Sell Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Sell Total</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-200">Net P/L</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={`${row.symbol}-${index}`} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 text-slate-200 font-semibold">{row.symbol}</td>
                    <td className="px-4 py-3 text-slate-300">{row.buyCount}</td>
                    <td className="px-4 py-3 text-slate-300">{row.buyQuantity}</td>
                    <td className="px-4 py-3 text-green-400">${row.buyTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-300">{row.sellCount}</td>
                    <td className="px-4 py-3 text-slate-300">{row.sellQuantity}</td>
                    <td className="px-4 py-3 text-red-400">${row.sellTotal.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-semibold ${
                      row.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {row.totalProfitLoss >= 0 ? '+' : ''}${row.totalProfitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredData.length > 0 && (
        <div className="mt-8 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h4 className="mb-4 text-white font-bold text-lg">Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Buy Transactions</div>
              <div className="text-lg font-bold text-white">
                {filteredData.reduce((sum, row) => sum + row.buyCount, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Sell Transactions</div>
              <div className="text-lg font-bold text-white">
                {filteredData.reduce((sum, row) => sum + row.sellCount, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Buy Quantity</div>
              <div className="text-lg font-bold text-green-400">
                {filteredData.reduce((sum, row) => sum + row.buyQuantity, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Sell Quantity</div>
              <div className="text-lg font-bold text-red-400">
                {filteredData.reduce((sum, row) => sum + row.sellQuantity, 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Buy Amount</div>
              <div className="text-lg font-bold text-green-400">
                ${filteredData.reduce((sum, row) => sum + row.buyTotal, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Total Sell Amount</div>
              <div className="text-lg font-bold text-red-400">
                ${filteredData.reduce((sum, row) => sum + row.sellTotal, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-2">Net Profit/Loss</div>
              <div className={`text-lg font-bold ${
                filteredData.reduce((sum, row) => sum + row.totalProfitLoss, 0) >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                ${filteredData.reduce((sum, row) => sum + row.totalProfitLoss, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statements;

