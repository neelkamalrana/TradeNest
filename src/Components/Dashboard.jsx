import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import HeaderControls from './HeaderControls';
import StockCard from './StockCard';
import PortfolioStockCard from './PortfolioStockCard';
import BalanceCard from './BalanceCard';
import Transactions from './Transactions';
import Statements from './Statements';
import Market from './Market';
import SubscribedStocks from './SubscribedStocks';
import RecentTransactions from './RecentTransactions';

const STOCK_NAMES = {
  'GOOG': 'Google (Alphabet Inc.)',
  'TSLA': 'Tesla Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation',
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'NFLX': 'Netflix Inc.',
  'AMD': 'Advanced Micro Devices',
  'INTC': 'Intel Corporation',
  'JPM': 'JPMorgan Chase & Co.',
  'V': 'Visa Inc.',
  'MA': 'Mastercard Inc.',
  'DIS': 'The Walt Disney Company',
  'NKE': 'Nike Inc.',
  'WMT': 'Walmart Inc.',
  'JNJ': 'Johnson & Johnson',
  'PG': 'Procter & Gamble Co.',
  'KO': 'The Coca-Cola Company',
  'PEP': 'PepsiCo Inc.'
};

const Dashboard = ({ 
  user, 
  currentAccount,
  accountStocks,
  stockPrices,
  stockPriceErrors,
  onSubscribe,
  onUnsubscribe,
  onBuy,
  onSell,
  onLogout,
  fetchStockPriceOnDemand
}) => {
  const [priceHistory, setPriceHistory] = useState({});
  const [currentSection, setCurrentSection] = useState('market');

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
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar 
        onLogout={onLogout} 
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {currentSection === 'subscribed' && (
          <div className="p-6">
            <HeaderControls
              accountStocks={accountStocks}
              onSubscribe={onSubscribe}
            />
          </div>
        )}

        <div className="flex-1 px-6 pb-6">
          {currentSection === 'market' ? (
            <>
              <Market
                accountStocks={accountStocks}
                stockPrices={stockPrices}
                stockPriceErrors={stockPriceErrors}
                onSubscribe={onSubscribe}
                fetchStockPriceOnDemand={fetchStockPriceOnDemand}
              />
              <RecentTransactions currentAccount={currentAccount} />
            </>
          ) : currentSection === 'subscribed' ? (
            <>
              <SubscribedStocks
                accountStocks={accountStocks}
                stockPrices={stockPrices}
                stockPriceErrors={stockPriceErrors}
                priceHistory={priceHistory}
                onUnsubscribe={onUnsubscribe}
                onBuy={onBuy}
                onSell={onSell}
                holdings={currentAccount?.holdings}
                balance={currentAccount?.balance || 0}
                fetchStockPriceOnDemand={fetchStockPriceOnDemand}
              />
              <RecentTransactions currentAccount={currentAccount} />
            </>
          ) : currentSection === 'transactions' ? (
            <Transactions currentAccount={currentAccount} />
          ) : currentSection === 'statements' ? (
            <>
              <Statements 
                currentAccount={currentAccount}
              />
              <RecentTransactions currentAccount={currentAccount} />
            </>
          ) : currentSection === 'portfolio' ? (
            <>
              {currentAccount && (
                <BalanceCard balance={currentAccount.balance} />
              )}
              <h4 className="text-xl font-bold text-white mt-6 mb-5">My Portfolio</h4>
              {(() => {
                // Filter to only show stocks that have been bought (have holdings)
                const stocksWithHoldings = accountStocks.filter(symbol => {
                  const holding = currentAccount?.holdings?.[symbol];
                  return holding && holding.quantity > 0;
                });

                return stocksWithHoldings.length === 0 ? (
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-10 text-center text-slate-400">
                    No stocks in your portfolio. Buy stocks from the Subscribed section to add them here.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                      {stocksWithHoldings.map(symbol => (
                        <PortfolioStockCard
                          key={symbol}
                          symbol={symbol}
                          companyName={STOCK_NAMES[symbol]}
                          price={stockPrices[symbol]}
                          priceHistory={priceHistory[symbol]}
                          priceError={stockPriceErrors?.[symbol]}
                          onUnsubscribe={() => onUnsubscribe(symbol)}
                          onBuy={onBuy}
                          onSell={onSell}
                          holdings={currentAccount?.holdings}
                          balance={currentAccount?.balance || 0}
                        />
                      ))}
                    </div>
                  
                    <RecentTransactions currentAccount={currentAccount} />
                  </>
                );
              })()}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
