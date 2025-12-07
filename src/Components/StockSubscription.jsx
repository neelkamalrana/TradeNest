import React, { useState } from 'react';

const AVAILABLE_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

const StockSubscription = ({ userStocks, onSubscribe, stockNames }) => {
  const [selectedStocks, setSelectedStocks] = useState([]);

  const toggleStock = (symbol) => {
    if (selectedStocks.includes(symbol)) {
      setSelectedStocks(selectedStocks.filter(s => s !== symbol));
    } else {
      setSelectedStocks([...selectedStocks, symbol]);
    }
  };

  const handleSubscribe = () => {
    if (selectedStocks.length > 0) {
      // Filter out already subscribed stocks
      const newStocks = selectedStocks.filter(s => !userStocks.includes(s));
      if (newStocks.length > 0) {
        onSubscribe(newStocks);
        setSelectedStocks([]);
      }
    }
  };

  const getAvailableStocks = () => {
    return AVAILABLE_STOCKS.filter(symbol => !userStocks.includes(symbol));
  };

  const availableStocks = getAvailableStocks();

  return (
    <div className="header-controls">
      <div className="controls">
        <select
          value=""
          onChange={(e) => {
            if (e.target.value && !selectedStocks.includes(e.target.value) && !userStocks.includes(e.target.value)) {
              toggleStock(e.target.value);
            }
          }}
        >
          <option disabled value="">Select Stock to Subscribe</option>
          {AVAILABLE_STOCKS.map(symbol => (
            <option 
              key={symbol} 
              value={symbol}
              disabled={userStocks.includes(symbol)}
            >
              {symbol} - {stockNames[symbol]} {userStocks.includes(symbol) ? '(Subscribed)' : ''}
            </option>
          ))}
        </select>

        {selectedStocks.length > 0 && (
          <button
            className="subscribe-button"
            onClick={handleSubscribe}
          >
            Subscribe ({selectedStocks.length})
          </button>
        )}

        {selectedStocks.length > 0 && (
          <button
            onClick={() => setSelectedStocks([])}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default StockSubscription;
