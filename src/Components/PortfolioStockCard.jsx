import React, { useState } from 'react';

const PortfolioStockCard = ({ symbol, companyName, price, priceHistory, priceError, onUnsubscribe, onBuy, onSell, holdings, balance }) => {
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
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 transition-all hover:shadow-lg relative">
      {/* Unsubscribe button */}
      <button 
        onClick={onUnsubscribe}
        className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xl cursor-pointer transition-colors"
        title="Unsubscribe"
      >
        ×
      </button>

      {/* Stock Info */}
      <div className="mb-3">
        <div className="text-white font-bold text-lg">{symbol}</div>
        <div className="text-slate-400 text-xs mt-1">
          {companyName}
        </div>
      </div>

      {/* Price */}
      <div className="mb-3">
        {priceError ? (
          <div className="text-red-400 text-sm font-medium bg-red-900/20 border border-red-800 rounded p-2">
            ⚠️ {priceError}
          </div>
        ) : price !== undefined && price > 0 ? (
          <>
            <div className="text-green-400 text-xl font-bold">
              ${price.toFixed(2)}
            </div>
            {change !== 0 && (
              <div className={`text-xs mt-1 font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent)}%)
              </div>
            )}
          </>
        ) : (
          <div className="text-slate-500 text-sm">Loading...</div>
        )}
      </div>

      {/* Holdings Info */}
      {holding.quantity > 0 && (
        <div className="mb-3 text-xs text-slate-400 space-y-1 border-t border-slate-700 pt-2">
          <div>Holding: {holding.quantity} shares</div>
          <div>Avg: ${holding.avgPrice.toFixed(2)}</div>
          <div>Value: ${totalValue.toFixed(2)}</div>
          <div className={`font-semibold ${
            profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            P/L: ${profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent}%)
          </div>
        </div>
      )}

      {/* Trade Buttons */}
      {!showTradeForm ? (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTradeType('buy');
              setShowTradeForm(true);
              setQuantity(1);
            }}
            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white border-none rounded-lg cursor-pointer text-xs font-semibold transition-colors"
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
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white border-none rounded-lg cursor-pointer text-xs font-semibold transition-colors"
            >
              Sell
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="number"
            min="1"
            max={tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity)))}
            className="w-full px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-xs text-slate-400">
            Max: {tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity} | Total: ${((quantity || 0) * (price || 0)).toFixed(2)}
          </div>
          <div className="flex gap-1">
            <button
              onClick={tradeType === 'buy' ? handleBuy : handleSell}
              disabled={quantity <= 0 || (tradeType === 'buy' && quantity > maxBuyQuantity) || (tradeType === 'sell' && quantity > maxSellQuantity)}
              className={`flex-1 py-1.5 text-white border-none rounded cursor-pointer text-xs font-semibold transition-all ${
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
  );
};

export default PortfolioStockCard;

