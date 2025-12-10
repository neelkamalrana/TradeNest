import React from 'react';

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

const Market = ({ accountStocks, stockPrices, onSubscribe }) => {
  const subscribedSet = new Set(accountStocks);
  
  const handleSubscribe = (symbol) => {
    if (!subscribedSet.has(symbol)) {
      onSubscribe(symbol);
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
          
          return (
            <div
              key={symbol}
              className={`bg-slate-800 border rounded-lg p-4 transition-all hover:shadow-lg ${
                isSubscribed 
                  ? 'border-green-500 bg-slate-800/80' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
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
                {price !== undefined ? (
                  <div className="text-green-400 text-xl font-bold">
                    ${price.toFixed(2)}
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm">Loading...</div>
                )}
              </div>
              
              <button
                onClick={() => handleSubscribe(symbol)}
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

