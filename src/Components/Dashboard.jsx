import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import HeaderControls from './HeaderControls';
import StockCard from './StockCard';
import BalanceCard from './BalanceCard';
import Transactions from './Transactions';
import Statements from './Statements';

const STOCK_NAMES = {
  'GOOG': 'Google (Alphabet Inc.)',
  'TSLA': 'Tesla Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation'
};

const Dashboard = ({ 
  user, 
  companies,
  companyId,
  setCompanyId,
  accounts,
  accountId,
  setAccountId,
  currentAccount,
  accountStocks,
  stockPrices,
  onSubscribe,
  onUnsubscribe,
  onBuy,
  onSell,
  onLogout 
}) => {
  const [priceHistory, setPriceHistory] = useState({});
  const [currentSection, setCurrentSection] = useState('loads');

  // Track price changes for animation
  useEffect(() => {
    accountStocks.forEach(symbol => {
      if (stockPrices[symbol] !== undefined) {
        setPriceHistory(prev => {
          const oldPrice = prev[symbol]?.current;
          const newPrice = stockPrices[symbol];
          
          return {
            ...prev,
            [symbol]: {
              current: newPrice,
              previous: oldPrice || newPrice,
              change: oldPrice ? newPrice - oldPrice : 0
            }
          };
        });
      }
    });
  }, [stockPrices, accountStocks]);

  return (
    <div className="app-root">
      <Sidebar 
        onLogout={onLogout} 
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />
      <div className="main-area">
        <HeaderControls
          companies={companies}
          companyId={companyId}
          setCompanyId={setCompanyId}
          accounts={accounts}
          accountId={accountId}
          setAccountId={setAccountId}
          accountStocks={accountStocks}
          onSubscribe={onSubscribe}
        />

        <div className="content-body">
          {currentSection === 'transactions' ? (
            <Transactions currentAccount={currentAccount} />
          ) : currentSection === 'statements' ? (
            <Statements 
              companies={companies}
              companyId={companyId}
              accountId={accountId}
            />
          ) : currentSection === 'loads' ? (
            <>
              {!accountId ? (
                <div className="placeholder">Select a company and account to view stock details.</div>
              ) : (
                <>
                  {currentAccount && (
                    <BalanceCard balance={currentAccount.balance} />
                  )}
                  <h4 className="section-title">Latest Stock Prices are displayed here</h4>
                  {accountStocks.length === 0 ? (
                    <div className="placeholder">No stocks subscribed. Select a stock from the dropdown above.</div>
                  ) : (
                    <>
                      <div className="stocks-grid">
                        {accountStocks.map(symbol => (
                          <StockCard
                            key={symbol}
                            symbol={symbol}
                            companyName={STOCK_NAMES[symbol]}
                            price={stockPrices[symbol]}
                            priceHistory={priceHistory[symbol]}
                            onUnsubscribe={() => onUnsubscribe(symbol)}
                            onBuy={onBuy}
                            onSell={onSell}
                            holdings={currentAccount?.holdings}
                            balance={currentAccount?.balance || 0}
                          />
                        ))}
                      </div>
                      
                      {currentAccount?.transactions && currentAccount.transactions.length > 0 && (
                        <div style={{ marginTop: '40px' }}>
                          <h4 className="section-title">Recent Transactions</h4>
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
                                {currentAccount.transactions.slice(0, 5).map((transaction) => (
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
                                      color: transaction.profitLoss ? (transaction.profitLoss >= 0 ? '#008b48' : '#e74c3c') : '#666'
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
                      )}
                    </>
                  )}
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
