import React, { useState } from 'react';

const StockCard = ({ symbol, companyName, price, priceHistory, onUnsubscribe, onBuy, onSell, holdings, balance }) => {
  const change = priceHistory?.change || 0;
  const previousPrice = priceHistory?.previous || price;
  const changePercent = previousPrice ? ((change / previousPrice) * 100).toFixed(2) : 0;
  const isPositive = change >= 0;
  const [quantity, setQuantity] = useState(1);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeType, setTradeType] = useState('buy');

  const holding = holdings?.[symbol] || { quantity: 0, avgPrice: 0 };
  const totalValue = holding.quantity * (price || 0);
  const profitLoss = holding.quantity > 0 ? ((price || 0) - holding.avgPrice) * holding.quantity : 0;
  const profitLossPercent = holding.avgPrice > 0 ? (((price || 0) - holding.avgPrice) / holding.avgPrice * 100).toFixed(2) : 0;

  const maxBuyQuantity = price > 0 ? Math.floor(balance / price) : 0;
  const maxSellQuantity = holding.quantity;

  const handleBuy = () => {
    if (quantity > 0 && quantity <= maxBuyQuantity && price > 0) {
      onBuy(symbol, quantity, price);
      setQuantity(1);
      setShowTradeForm(false);
    }
  };

  const handleSell = () => {
    if (quantity > 0 && quantity <= maxSellQuantity && price > 0) {
      onSell(symbol, quantity, price);
      setQuantity(1);
      setShowTradeForm(false);
    }
  };

  return (
    <div className="relative w-full max-w-3xl flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-6">
      <div className="bg-slate-700 rounded-xl p-4 flex items-center justify-center">
        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="flex-1">
        <div className="text-white text-lg font-bold mb-1">{symbol} - {companyName}</div>
        <div className="text-green-400 text-2xl font-bold">
          ${price !== undefined ? price.toFixed(2) : '--.--'}
        </div>
        {change !== 0 && (
          <div className={`text-sm mt-1 font-medium ${
            isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent)}%)
          </div>
        )}
        {holding.quantity > 0 && (
          <div className="mt-3 text-sm text-slate-400 space-y-1">
            <div>Holding: {holding.quantity} shares</div>
            <div>Avg Price: ${holding.avgPrice.toFixed(2)}</div>
            <div>Total Value: ${totalValue.toFixed(2)}</div>
            <div className={`font-semibold mt-1 ${
              profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              P/L: ${profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent}%)
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2 items-end">
        <button 
          onClick={onUnsubscribe}
          className="bg-transparent border-none text-red-400 text-2xl cursor-pointer p-2 hover:text-red-300 transition-colors"
          title="Unsubscribe"
        >
          ×
        </button>
        
        {!showTradeForm ? (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTradeType('buy');
                setShowTradeForm(true);
                setQuantity(1);
              }}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white border-none rounded-lg cursor-pointer text-xs font-semibold transition-colors"
            >
              Buy
            </button>
            {holding.quantity > 0 && (
              <button
                onClick={() => {
                  setTradeType('sell');
                  setShowTradeForm(true);
                  setQuantity(1);
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg cursor-pointer text-xs font-semibold transition-colors"
              >
                Sell
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 items-end min-w-[150px]">
            <input
              type="number"
              min="1"
              max={tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity)))}
              className="w-20 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-xs text-slate-400 text-right">
              Max: {tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity}
            </div>
            <div className="text-xs text-slate-400 text-right">
              Total: ${((quantity || 0) * (price || 0)).toFixed(2)}
            </div>
            <div className="flex gap-1">
              <button
                onClick={tradeType === 'buy' ? handleBuy : handleSell}
                disabled={quantity <= 0 || (tradeType === 'buy' && quantity > maxBuyQuantity) || (tradeType === 'sell' && quantity > maxSellQuantity)}
                className={`px-3 py-1.5 text-white border-none rounded cursor-pointer text-xs font-semibold transition-all ${
                  tradeType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                } ${
                  (quantity <= 0 || (tradeType === 'buy' && quantity > maxBuyQuantity) || (tradeType === 'sell' && quantity > maxSellQuantity)) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'}
              </button>
              <button
                onClick={() => {
                  setShowTradeForm(false);
                  setQuantity(1);
                }}
                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white border-none rounded cursor-pointer text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockCard;
