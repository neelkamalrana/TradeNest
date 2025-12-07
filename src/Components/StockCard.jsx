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
    <div className="balance-card" style={{ position: 'relative', width: '100%', maxWidth: '700px' }}>
      <div className="balance-icon">
        <i className="fa-solid fa-chart-line"></i>
      </div>
      <div className="balance-text" style={{ flex: 1 }}>
        <div className="balance-title">{symbol} - {companyName}</div>
        <div className="balance-amount">
          ${price !== undefined ? price.toFixed(2) : '--.--'}
        </div>
        {change !== 0 && (
          <div style={{ 
            fontSize: '14px', 
            color: isPositive ? '#008b48' : '#e74c3c',
            marginTop: '4px',
            fontWeight: '500'
          }}>
            {isPositive ? '↑' : '↓'} ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent)}%)
          </div>
        )}
        {holding.quantity > 0 && (
          <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
            <div>Holding: {holding.quantity} shares</div>
            <div>Avg Price: ${holding.avgPrice.toFixed(2)}</div>
            <div>Total Value: ${totalValue.toFixed(2)}</div>
            <div style={{ color: profitLoss >= 0 ? '#008b48' : '#e74c3c', fontWeight: '600', marginTop: '4px' }}>
              P/L: ${profitLoss >= 0 ? '+' : ''}{profitLoss.toFixed(2)} ({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent}%)
            </div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
        <button 
          onClick={onUnsubscribe}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e74c3c',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px 10px',
            lineHeight: '1'
          }}
          title="Unsubscribe"
        >
          ×
        </button>
        
        {!showTradeForm ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                setTradeType('buy');
                setShowTradeForm(true);
                setQuantity(1);
              }}
              style={{
                padding: '8px 16px',
                background: '#008b48',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600'
              }}
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
                style={{
                  padding: '8px 16px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              >
                Sell
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', minWidth: '150px' }}>
            <input
              type="number"
              min="1"
              max={tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity)))}
              style={{
                width: '80px',
                padding: '6px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <div style={{ fontSize: '11px', color: '#666', textAlign: 'right' }}>
              Max: {tradeType === 'buy' ? maxBuyQuantity : maxSellQuantity}
            </div>
            <div style={{ fontSize: '11px', color: '#666', textAlign: 'right' }}>
              Total: ${((quantity || 0) * (price || 0)).toFixed(2)}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={tradeType === 'buy' ? handleBuy : handleSell}
                disabled={quantity <= 0 || (tradeType === 'buy' && quantity > maxBuyQuantity) || (tradeType === 'sell' && quantity > maxSellQuantity)}
                style={{
                  padding: '6px 12px',
                  background: tradeType === 'buy' ? '#008b48' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  opacity: (quantity <= 0 || (tradeType === 'buy' && quantity > maxBuyQuantity) || (tradeType === 'sell' && quantity > maxSellQuantity)) ? 0.5 : 1
                }}
              >
                {tradeType === 'buy' ? 'Buy' : 'Sell'}
              </button>
              <button
                onClick={() => {
                  setShowTradeForm(false);
                  setQuantity(1);
                }}
                style={{
                  padding: '6px 12px',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
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
