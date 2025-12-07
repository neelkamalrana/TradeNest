import React, { useState, useEffect } from 'react';

const Statements = ({ companies, companyId, accountId }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(companyId || '');
  const [selectedAccount, setSelectedAccount] = useState(accountId || '');

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
    if (startDate && endDate && companies.length > 0) {
      generateStatements();
    }
  }, [startDate, endDate, selectedCompany, selectedAccount, companies]);

  const generateStatements = () => {
    const statements = [];
    
    // Return early if no companies
    if (!companies || companies.length === 0) {
      setFilteredData([]);
      return;
    }
    
    // Filter companies
    const companiesToProcess = selectedCompany 
      ? companies.filter(c => c.id === selectedCompany)
      : companies;

    companiesToProcess.forEach(company => {
      // Filter accounts
      const accountsToProcess = selectedAccount && selectedCompany
        ? company.accounts.filter(a => a.id === selectedAccount)
        : company.accounts;

      accountsToProcess.forEach(account => {
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

        // Convert to array and add company/account info
        Object.values(stockWiseData).forEach(stockData => {
          statements.push({
            company: company.name,
            account: account.name,
            ...stockData
          });
        });
      });
    });

    setFilteredData(statements);
  };

  const handleDateRangeChange = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      generateStatements();
    }
  };

  const allCompanies = companies;
  const selectedCompanyData = allCompanies.find(c => c.id === selectedCompany);
  const availableAccounts = selectedCompanyData?.accounts || [];

  return (
    <div>
      <h4 className="section-title">Statements</h4>
      
      {/* Filters */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Company
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setSelectedAccount(''); // Reset account when company changes
              }}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">All Companies</option>
              {allCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Account
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              disabled={!selectedCompany}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                opacity: selectedCompany ? 1 : 0.6
              }}
            >
              <option value="">All Accounts</option>
              {availableAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {startDate && endDate && new Date(startDate) > new Date(endDate) && (
          <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '10px' }}>
            Start date cannot be after end date
          </div>
        )}
      </div>

      {/* Statements Table */}
      {filteredData.length === 0 ? (
        <div className="placeholder">
          {startDate && endDate 
            ? 'No transactions found for the selected date range and filters.'
            : 'Please select a date range to view statements.'
          }
        </div>
      ) : (
        <div className="table-wrap">
          <table className="loads-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Account</th>
                <th>Stock</th>
                <th>Buy Count</th>
                <th>Buy Quantity</th>
                <th>Buy Total</th>
                <th>Sell Count</th>
                <th>Sell Quantity</th>
                <th>Sell Total</th>
                <th>Net P/L</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`${row.company}-${row.account}-${row.symbol}-${index}`}>
                  <td>{row.company}</td>
                  <td>{row.account}</td>
                  <td style={{ fontWeight: '600' }}>{row.symbol}</td>
                  <td>{row.buyCount}</td>
                  <td>{row.buyQuantity}</td>
                  <td style={{ color: '#008b48' }}>${row.buyTotal.toFixed(2)}</td>
                  <td>{row.sellCount}</td>
                  <td>{row.sellQuantity}</td>
                  <td style={{ color: '#e74c3c' }}>${row.sellTotal.toFixed(2)}</td>
                  <td style={{ 
                    color: row.totalProfitLoss >= 0 ? '#008b48' : '#e74c3c',
                    fontWeight: '600'
                  }}>
                    {row.totalProfitLoss >= 0 ? '+' : ''}${row.totalProfitLoss.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {filteredData.length > 0 && (
        <div style={{ 
          marginTop: '30px',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>Summary</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Buy Transactions</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                {filteredData.reduce((sum, row) => sum + row.buyCount, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Sell Transactions</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>
                {filteredData.reduce((sum, row) => sum + row.sellCount, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Buy Quantity</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#008b48' }}>
                {filteredData.reduce((sum, row) => sum + row.buyQuantity, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Sell Quantity</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#e74c3c' }}>
                {filteredData.reduce((sum, row) => sum + row.sellQuantity, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Buy Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#008b48' }}>
                ${filteredData.reduce((sum, row) => sum + row.buyTotal, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Total Sell Amount</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#e74c3c' }}>
                ${filteredData.reduce((sum, row) => sum + row.sellTotal, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Net Profit/Loss</div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '700',
                color: filteredData.reduce((sum, row) => sum + row.totalProfitLoss, 0) >= 0 ? '#008b48' : '#e74c3c'
              }}>
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

