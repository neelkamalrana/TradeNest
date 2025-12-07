import React, { useState } from "react";

const AVAILABLE_STOCKS = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

export default function HeaderControls({ 
  companies, 
  companyId, 
  setCompanyId, 
  accounts, 
  accountId, 
  setAccountId,
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
    <header className="header-controls">
      <div className="controls">
        <select 
          value={companyId} 
          onChange={(e) => setCompanyId(e.target.value)}
        >
          <option disabled value="">Company Name</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={accountId} 
          onChange={(e) => setAccountId(e.target.value)}
          disabled={!companyId}
        >
          <option disabled value="">Account Name</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {accountId && (
          <select
            value={selectedStock}
            onChange={handleStockSelect}
            style={{ marginLeft: '20px' }}
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
        )}
      </div>
    </header>
  );
}
