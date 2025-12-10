import React, { useState } from 'react';

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

const AVAILABLE_STOCKS = [
  'GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 
  'AAPL', 'MSFT', 'NFLX', 'AMD', 'INTC',
  'JPM', 'V', 'MA', 'DIS', 'NKE',
  'WMT', 'JNJ', 'PG', 'KO', 'PEP'
];

const Market = ({ accountStocks, stockPrices, stockPriceErrors, onSubscribe, fetchStockPriceOnDemand }) => {
  const subscribedSet = new Set(accountStocks);
  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [loadingSymbols, setLoadingSymbols] = useState(new Set());
  
  // Debug: log when accountStocks changes
  React.useEffect(() => {
    console.log('Market component - accountStocks updated:', accountStocks);
  }, [accountStocks]);
  
  const handleSubscribe = (symbol) => {
    console.log('Market handleSubscribe called:', symbol, 'accountStocks:', accountStocks, 'subscribedSet:', Array.from(subscribedSet));
    if (!subscribedSet.has(symbol)) {
      console.log('Subscribing to stock:', symbol);
      if (onSubscribe) {
        onSubscribe(symbol);
      } else {
        console.error('onSubscribe function is not provided!');
      }
    } else {
      console.log('Already subscribed to:', symbol);
    }
  };

  const handleMouseEnter = async (symbol) => {
    setHoveredSymbol(symbol);
    // Only fetch if we don't have a price or have an error
    if ((!stockPrices[symbol] || stockPriceErrors?.[symbol]) && !loadingSymbols.has(symbol)) {
      setLoadingSymbols(prev => new Set(prev).add(symbol));
      if (fetchStockPriceOnDemand) {
        await fetchStockPriceOnDemand(symbol);
      }
      setLoadingSymbols(prev => {
        const newSet = new Set(prev);
        newSet.delete(symbol);
        return newSet;
      });
    }
  };

  return (
    <div>
      <h4 className="text-xl font-bold text-white mb-5">Stock Market - Browse & Subscribe</h4>
      <p className="text-slate-400 mb-6 text-sm">
        Browse all available stocks. Subscribe to stocks to track them in your Portfolio.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AVAILABLE_STOCKS.map(symbol => {
          const isSubscribed = subscribedSet.has(symbol);
          const price = stockPrices[symbol];
          const error = stockPriceErrors?.[symbol];
          const isLoading = loadingSymbols.has(symbol);
          
          return (
            <div
              key={symbol}
              className={`bg-slate-800 border rounded-lg p-4 transition-all hover:shadow-lg ${
                isSubscribed 
                  ? 'border-green-500 bg-slate-800/80' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
              onMouseEnter={() => handleMouseEnter(symbol)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-white font-bold text-lg">{symbol}</div>
                  <div className="text-slate-400 text-xs mt-1">
                    {STOCK_NAMES[symbol] || symbol}
                  </div>
                </div>
                {isSubscribed && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                    Subscribed
                  </span>
                )}
              </div>
              
              <div className="mb-4">
                {error ? (
                  <div className="text-red-400 text-xs font-medium bg-red-900/20 border border-red-800 rounded p-2">
                    ⚠️ {error}
                  </div>
                ) : price !== undefined && price > 0 ? (
                  <div className="text-green-400 text-xl font-bold">
                    ${price.toFixed(2)}
                  </div>
                ) : isLoading ? (
                  <div className="text-blue-400 text-sm">Fetching...</div>
                ) : (
                  <div className="text-slate-500 text-sm">Hover to load price</div>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Button clicked for:', symbol, 'isSubscribed:', isSubscribed);
                  handleSubscribe(symbol);
                }}
                disabled={isSubscribed}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                  isSubscribed
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Market;

