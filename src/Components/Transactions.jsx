import React from 'react';

const Transactions = ({ currentAccount }) => {
  if (!currentAccount || !currentAccount.transactions || currentAccount.transactions.length === 0) {
    return (
      <div className="placeholder">
        No transactions found. Start trading to see your transaction history here.
      </div>
    );
  }

  return (
    <div>
      <h4 className="section-title">All Transactions</h4>
      <div className="table-wrap">
        <table className="loads-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {currentAccount.transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td style={{ 
                  color: transaction.type === 'BUY' ? '#008b48' : '#e74c3c',
                  fontWeight: '600'
                }}>
                  {transaction.type}
                </td>
                <td>{transaction.symbol}</td>
                <td>{transaction.quantity}</td>
                <td>${transaction.price.toFixed(2)}</td>
                <td>${transaction.total.toFixed(2)}</td>
                <td style={{ 
                  color: transaction.profitLoss ? (transaction.profitLoss >= 0 ? '#008b48' : '#e74c3c') : '#666',
                  fontWeight: transaction.profitLoss ? '600' : 'normal'
                }}>
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
  );
};

export default Transactions;

