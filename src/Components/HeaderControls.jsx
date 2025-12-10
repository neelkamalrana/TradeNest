import React, { useState } from "react";

const AVAILABLE_STOCKS = [
  'GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 
  'AAPL', 'MSFT', 'NFLX', 'AMD', 'INTC',
  'JPM', 'V', 'MA', 'DIS', 'NKE',
  'WMT', 'JNJ', 'PG', 'KO', 'PEP'
];

export default function HeaderControls({ 
  accountStocks,
  onSubscribe 
}) {
  const [selectedStock, setSelectedStock] = useState("");

  const availableStocks = AVAILABLE_STOCKS.filter(symbol => !accountStocks.includes(symbol));

  const handleStockSelect = (e) => {
    const symbol = e.target.value;
    setSelectedStock("");
    if (symbol && !accountStocks.includes(symbol)) {
      onSubscribe(symbol);
    }
  };

  return (
    <header className="flex justify-end items-center gap-5 mb-10">
      <div className="flex gap-5 items-center">
        <select
          value={selectedStock}
          onChange={handleStockSelect}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 border border-blue-500 rounded-lg text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent cursor-pointer transition-all pr-10"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='none' stroke='%23ffffff' stroke-width='1.5' d='M1 1l5 5 5-5'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            backgroundSize: '12px',
            appearance: 'none'
          }}
        >
          <option disabled value="">Subscribe to Stock</option>
          {availableStocks.map(symbol => (
            <option key={symbol} value={symbol}>
              {symbol}
            </option>
          ))}
          {availableStocks.length === 0 && (
            <option disabled value="">All stocks subscribed</option>
          )}
        </select>
      </div>
    </header>
  );
}
