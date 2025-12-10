import React, { useState, useEffect } from 'react';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';

// Stock price service with real API integration
class StockPriceService {
  constructor() {
    this.subscribers = new Map(); // Map of accountId -> Set of stock symbols
    this.prices = new Map(); // Map of symbol -> price
    this.priceCallbacks = new Map(); // Map of accountId -> callback function
    this.intervalId = null;
    this.isUpdating = false; // Prevent concurrent updates
    this.updateInterval = 10000; // Update every 10 seconds to respect API rate limits
    this.apiKey = null; // Optional API key for Finnhub (can be set via environment variable)
    
    // Fallback prices in case API fails
    this.fallbackPrices = {
      'GOOG': 150.50,
      'TSLA': 250.75,
      'AMZN': 175.25,
      'META': 485.30,
      'NVDA': 890.45,
      'AAPL': 180.00,
      'MSFT': 420.00,
      'NFLX': 450.00,
      'AMD': 120.00,
      'INTC': 45.00,
      'JPM': 150.00,
      'V': 250.00,
      'MA': 400.00,
      'DIS': 100.00,
      'NKE': 110.00,
      'WMT': 160.00,
      'JNJ': 160.00,
      'PG': 150.00,
      'KO': 60.00,
      'PEP': 170.00
    };
    
    // Initialize with fallback prices
    Object.keys(this.fallbackPrices).forEach(symbol => {
      this.prices.set(symbol, this.fallbackPrices[symbol]);
    });
    
    // Initialize all available stocks with fallback prices if not already set
    const allStocks = [
      'GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 
      'AAPL', 'MSFT', 'NFLX', 'AMD', 'INTC',
      'JPM', 'V', 'MA', 'DIS', 'NKE',
      'WMT', 'JNJ', 'PG', 'KO', 'PEP'
    ];
    allStocks.forEach(symbol => {
      if (!this.prices.has(symbol)) {
        this.prices.set(symbol, this.fallbackPrices[symbol] || 0);
      }
    });
  }

  // Fetch real stock prices from API
  async fetchStockPrices(symbols) {
    const prices = {};
    const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
    
    // Try Yahoo Finance API first (no API key required, more reliable)
    try {
      const fetchPromises = symbolsArray.map(async (symbol) => {
        try {
          // Use a CORS proxy or direct API call
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
            {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
            if (price && price > 0) {
              console.log(`✓ Fetched price for ${symbol}: $${price.toFixed(2)}`);
              return { symbol, price: parseFloat(price.toFixed(2)) };
            }
          } else {
            console.warn(`Yahoo Finance API returned status ${response.status} for ${symbol}`);
          }
        } catch (err) {
          console.warn(`Yahoo Finance failed for ${symbol}:`, err.message);
        }
        return null;
      });
      
      const results = await Promise.all(fetchPromises);
      results.forEach(result => {
        if (result) {
          prices[result.symbol] = result.price;
        }
      });
      
      // Fill in any missing prices with fallback
      symbolsArray.forEach(symbol => {
        if (!prices[symbol]) {
          prices[symbol] = this.prices.get(symbol) || this.fallbackPrices[symbol] || 0;
        }
      });
      
      // If we got at least one price, return
      if (Object.keys(prices).some(s => prices[s] > 0)) {
        return prices;
      }
    } catch (error) {
      console.warn('Yahoo Finance API failed, trying Finnhub:', error);
    }
    
    // Fallback to Finnhub API (free tier: 60 calls/minute)
    try {
      const apiKey = this.apiKey || 'demo'; // 'demo' key works for limited requests
      
      const fetchPromises = symbolsArray.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.c && data.c > 0) {
              return { symbol, price: parseFloat(data.c.toFixed(2)) };
            }
          }
        } catch (err) {
          console.warn(`Finnhub failed for ${symbol}:`, err);
        }
        return null;
      });
      
      const results = await Promise.all(fetchPromises);
      results.forEach(result => {
        if (result && !prices[result.symbol]) {
          prices[result.symbol] = result.price;
        }
      });
    } catch (error) {
      console.warn('Finnhub API also failed:', error);
    }
    
    // Final fallback: use last known prices or default fallback prices
    symbolsArray.forEach(symbol => {
      if (!prices[symbol] || prices[symbol] === 0) {
        prices[symbol] = this.prices.get(symbol) || this.fallbackPrices[symbol] || 0;
      }
    });
    
    return prices;
  }

  // Start price updates for all subscribers
  startUpdates() {
    if (this.intervalId) return;
    
    // Fetch initial prices
    this.updatePrices();
    
    // Set up interval for updates
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, this.updateInterval);
  }

  // Stop price updates
  stopUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Fetch and update prices from API
  async updatePrices() {
    if (this.isUpdating) return; // Prevent concurrent updates
    
    const symbols = Array.from(this.prices.keys());
    if (symbols.length === 0) return;
    
    this.isUpdating = true;
    
    try {
      const newPrices = await this.fetchStockPrices(symbols);
      
      // Update prices map
      Object.keys(newPrices).forEach(symbol => {
        if (newPrices[symbol] > 0) {
          this.prices.set(symbol, newPrices[symbol]);
        }
      });
      
      // Notify all subscribers
      this.priceCallbacks.forEach((callback, accountId) => {
        const accountStocks = this.subscribers.get(accountId) || new Set();
        const accountPrices = {};
        accountStocks.forEach(symbol => {
          accountPrices[symbol] = this.prices.get(symbol);
        });
        callback(accountPrices);
      });
    } catch (error) {
      console.error('Error updating prices:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // Subscribe account to stocks
  async subscribe(accountId, symbols, callback) {
    if (!this.subscribers.has(accountId)) {
      this.subscribers.set(accountId, new Set());
    }
    
    symbols.forEach(symbol => {
      this.subscribers.get(accountId).add(symbol);
      // Initialize price if not exists
      if (!this.prices.has(symbol)) {
        this.prices.set(symbol, this.fallbackPrices[symbol] || 0);
      }
    });
    
    this.priceCallbacks.set(accountId, callback);
    
    // Fetch real prices for new symbols
    try {
      const newPrices = await this.fetchStockPrices(symbols);
      Object.keys(newPrices).forEach(symbol => {
        if (newPrices[symbol] > 0) {
          this.prices.set(symbol, newPrices[symbol]);
        }
      });
    } catch (error) {
      console.warn('Failed to fetch initial prices:', error);
    }
    
    this.startUpdates();
    
    // Return initial prices
    const initialPrices = {};
    symbols.forEach(symbol => {
      initialPrices[symbol] = this.prices.get(symbol);
    });
    return initialPrices;
  }

  // Unsubscribe account from stocks
  unsubscribe(accountId, symbols) {
    if (this.subscribers.has(accountId)) {
      symbols.forEach(symbol => {
        this.subscribers.get(accountId).delete(symbol);
      });
      
      // If account has no subscriptions, remove them
      if (this.subscribers.get(accountId).size === 0) {
        this.subscribers.delete(accountId);
        this.priceCallbacks.delete(accountId);
      }
    }
    
    // Stop updates if no subscribers
    if (this.subscribers.size === 0) {
      this.stopUpdates();
    }
  }

  // Remove all subscriptions for an account
  unsubscribeAll(accountId) {
    this.subscribers.delete(accountId);
    this.priceCallbacks.delete(accountId);
    
    if (this.subscribers.size === 0) {
      this.stopUpdates();
    }
  }

  // Get current prices for symbols
  getPrices(symbols) {
    const prices = {};
    symbols.forEach(symbol => {
      prices[symbol] = this.prices.get(symbol);
    });
    return prices;
  }
}

// Singleton instance
const stockPriceService = new StockPriceService();

const AVAILABLE_STOCKS = [
  'GOOG', 'TSLA', 'AMZN', 'META', 'NVDA', 
  'AAPL', 'MSFT', 'NFLX', 'AMD', 'INTC',
  'JPM', 'V', 'MA', 'DIS', 'NKE',
  'WMT', 'JNJ', 'PG', 'KO', 'PEP'
];

function App() {
  const [user, setUser] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accountStocks, setAccountStocks] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [accountId, setAccountId] = useState("");
  const [allStockPrices, setAllStockPrices] = useState({});

  // Fetch and auto-load first company and account
  useEffect(() => {
    fetch("/companiesData.json")
      .then(res => res.json())
      .then(data => {
        // Auto-select first company and first account
        if (data.companies && data.companies.length > 0) {
          const firstCompany = data.companies[0];
          if (firstCompany.accounts && firstCompany.accounts.length > 0) {
            const firstAccount = firstCompany.accounts[0];
            
            // Initialize holdings and transactions if they don't exist
            if (!firstAccount.holdings) {
              firstAccount.holdings = {};
            }
            if (!firstAccount.transactions) {
              firstAccount.transactions = [];
            }
            
            setCurrentAccount({ ...firstAccount });
            setAccountId(firstAccount.id);
            const stocks = firstAccount.subscribedStocks || [];
            setAccountStocks(stocks);
            
            // Subscribe to stocks for this account
            if (stocks.length > 0) {
              stockPriceService.subscribe(
                firstAccount.id,
                stocks,
                (prices) => setStockPrices(prices)
              ).then(initialPrices => {
                setStockPrices(initialPrices);
              }).catch(err => {
                console.error('Failed to subscribe to stocks:', err);
                setStockPrices({});
              });
            } else {
              setStockPrices({});
            }
          }
        }
      })
      .catch(err => console.error("Failed to load companies data", err));
  }, []);

  // Fetch prices for all available stocks (for Market view)
  useEffect(() => {
    const fetchAllPrices = async () => {
      try {
        console.log('Fetching prices for all stocks:', AVAILABLE_STOCKS);
        const prices = await stockPriceService.fetchStockPrices(AVAILABLE_STOCKS);
        console.log('Fetched prices:', prices);
        setAllStockPrices(prices);
        
        // Also update the prices map in the service for future use
        Object.keys(prices).forEach(symbol => {
          if (prices[symbol] > 0) {
            stockPriceService.prices.set(symbol, prices[symbol]);
          }
        });
      } catch (err) {
        console.error('Failed to fetch all stock prices:', err);
      }
    };
    
    // Fetch immediately
    fetchAllPrices();
    // Update prices every 30 seconds for market view
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle login
  const handleLogin = (email) => {
    setUser(email);
    localStorage.setItem('stockDashboardUser', email);
  };

  // Handle logout
  const handleLogout = () => {
    if (accountId) {
      stockPriceService.unsubscribeAll(accountId);
    }
    setUser(null);
    setAccountId("");
    setCurrentAccount(null);
    setAccountStocks([]);
    setStockPrices({});
    localStorage.removeItem('stockDashboardUser');
  };

  // Handle subscribe to new stock
  const handleSubscribe = (symbol) => {
    if (!accountId || !currentAccount) return;
    
    const updatedStocks = [...new Set([...accountStocks, symbol])];
    setAccountStocks(updatedStocks);
    
    // Update current account
    const updatedAccount = {
      ...currentAccount,
      subscribedStocks: updatedStocks
    };
    setCurrentAccount(updatedAccount);
    
    // Subscribe to new stock
    stockPriceService.subscribe(
      accountId,
      [symbol],
      (prices) => setStockPrices(prev => ({ ...prev, ...prices }))
    ).then(initialPrices => {
      setStockPrices(prev => ({ ...prev, ...initialPrices }));
    }).catch(err => {
      console.error('Failed to subscribe to stock:', err);
    });
  };

  // Handle unsubscribe from stock
  const handleUnsubscribe = (symbol) => {
    if (!accountId) return;
    
    const updatedStocks = accountStocks.filter(s => s !== symbol);
    setAccountStocks(updatedStocks);
    
    // Update current account
    const updatedAccount = {
      ...currentAccount,
      subscribedStocks: updatedStocks
    };
    setCurrentAccount(updatedAccount);
    
    // Unsubscribe from stock
    stockPriceService.unsubscribe(accountId, [symbol]);
    const newPrices = { ...stockPrices };
    delete newPrices[symbol];
    setStockPrices(newPrices);
  };

  // Handle buy stock
  const handleBuy = (symbol, quantity, price) => {
    if (!accountId || !currentAccount) return;
    
    const totalCost = quantity * price;
    
    // Check if account has enough balance
    if (currentAccount.balance < totalCost) {
      alert('Insufficient balance!');
      return;
    }
    
    // Initialize holdings if needed
    if (!currentAccount.holdings) {
      currentAccount.holdings = {};
    }
    if (!currentAccount.transactions) {
      currentAccount.transactions = [];
    }
    
    // Update holdings
    if (currentAccount.holdings[symbol]) {
      const existingQuantity = currentAccount.holdings[symbol].quantity;
      const existingAvgPrice = currentAccount.holdings[symbol].avgPrice;
      const totalCostExisting = existingQuantity * existingAvgPrice;
      const newTotalCost = quantity * price;
      const newQuantity = existingQuantity + quantity;
      const newAvgPrice = (totalCostExisting + newTotalCost) / newQuantity;
      
      currentAccount.holdings[symbol] = {
        quantity: newQuantity,
        avgPrice: newAvgPrice
      };
    } else {
      currentAccount.holdings[symbol] = {
        quantity: quantity,
        avgPrice: price
      };
    }
    
    // Update balance
    currentAccount.balance -= totalCost;
    
    // Add transaction
    currentAccount.transactions.unshift({
      id: Date.now().toString(),
      type: 'BUY',
      symbol: symbol,
      quantity: quantity,
      price: price,
      total: totalCost,
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });
    
    // Update state
    setCurrentAccount({ ...currentAccount });
  };

  // Handle sell stock
  const handleSell = (symbol, quantity, price) => {
    if (!accountId || !currentAccount) return;
    
    const holding = currentAccount.holdings?.[symbol];
    
    // Check if account has enough shares
    if (!holding || holding.quantity < quantity) {
      alert('Insufficient shares!');
      return;
    }
    
    const totalRevenue = quantity * price;
    
    // Initialize transactions if needed
    if (!currentAccount.transactions) {
      currentAccount.transactions = [];
    }
    
    // Update holdings
    if (holding.quantity === quantity) {
      // Selling all shares
      delete currentAccount.holdings[symbol];
    } else {
      currentAccount.holdings[symbol] = {
        quantity: holding.quantity - quantity,
        avgPrice: holding.avgPrice // Keep average price
      };
    }
    
    // Update balance
    currentAccount.balance += totalRevenue;
    
    // Calculate profit/loss
    const profitLoss = (price - holding.avgPrice) * quantity;
    
    // Add transaction
    currentAccount.transactions.unshift({
      id: Date.now().toString(),
      type: 'SELL',
      symbol: symbol,
      quantity: quantity,
      price: price,
      total: totalRevenue,
      profitLoss: profitLoss,
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    });
    
    // Update state
    setCurrentAccount({ ...currentAccount });
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Merge subscribed stock prices with all stock prices for Market view
  // Prioritize subscribed prices (real-time updates) over market prices
  const mergedStockPrices = { ...allStockPrices, ...stockPrices };
  
  // Ensure all available stocks have at least fallback prices
  AVAILABLE_STOCKS.forEach(symbol => {
    if (!mergedStockPrices[symbol] || mergedStockPrices[symbol] === 0) {
      const fallbackPrice = stockPriceService.fallbackPrices[symbol] || stockPriceService.prices.get(symbol) || 0;
      if (fallbackPrice > 0) {
        mergedStockPrices[symbol] = fallbackPrice;
      }
    }
  });

  return (
    <Dashboard
      user={user}
      currentAccount={currentAccount}
      accountStocks={accountStocks}
      stockPrices={mergedStockPrices}
      onSubscribe={handleSubscribe}
      onUnsubscribe={handleUnsubscribe}
      onBuy={handleBuy}
      onSell={handleSell}
      onLogout={handleLogout}
    />
  );
}

export default App;
