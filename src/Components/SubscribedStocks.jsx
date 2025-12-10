import React, { useState, useEffect } from 'react';
import PortfolioStockCard from './PortfolioStockCard';

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

const SubscribedStocks = ({ 
  accountStocks, 
  stockPrices, 
  stockPriceErrors,
  priceHistory,
  onUnsubscribe,
  onBuy,
  onSell,
  holdings,
  balance,
  fetchStockPriceOnDemand
}) => {
  // Update prices every 10 seconds for subscribed stocks
  useEffect(() => {
    if (accountStocks.length === 0 || !fetchStockPriceOnDemand) return;

    const updatePrices = async () => {
      // Fetch prices for all subscribed stocks
      for (const symbol of accountStocks) {
        await fetchStockPriceOnDemand(symbol);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    };

    // Update immediately
    updatePrices();

    // Then update every 10 seconds
    const interval = setInterval(updatePrices, 10000);
    return () => clearInterval(interval);
  }, [accountStocks, fetchStockPriceOnDemand]);

  return (
    <div>
      <h4 className="text-xl font-bold text-white mb-5">Subscribed Stocks</h4>
      <p className="text-slate-400 mb-6 text-sm">
        All stocks you're currently tracking. Buy stocks to add them to your Portfolio.
      </p>
      
      {accountStocks.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-10 text-center text-slate-400">
          No stocks subscribed. Go to Market section to subscribe to stocks.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accountStocks.map(symbol => (
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
              holdings={holdings}
              balance={balance}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscribedStocks;

