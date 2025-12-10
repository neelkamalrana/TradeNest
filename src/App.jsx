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
    this.priceErrors = {}; // Map of symbol -> error message
  }

  // Fetch real stock prices from Yahoo Finance API only
  async fetchStockPrices(symbols) {
    const prices = {};
    const errors = {};
    const symbolsArray = Array.isArray(symbols) ? symbols : [symbols];
    
    const fetchPromises = symbolsArray.map(async (symbol) => {
      try {
        // Try direct API call first
        let response;
        let useProxy = false;
        
        try {
          response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
            {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              },
            }
          );
        } catch (corsError) {
          // If CORS fails, try using a public CORS proxy
          useProxy = true;
          try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`)}`;
            response = await fetch(proxyUrl);
          } catch (proxyError) {
            throw new Error('Unable to fetch live prices. API request failed.');
          }
        }
        
        if (response.ok) {
          let data;
          if (useProxy) {
            const proxyData = await response.json();
            data = JSON.parse(proxyData.contents);
          } else {
            data = await response.json();
          }
          
          const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (price && price > 0) {
            console.log(`✓ Fetched price for ${symbol}: $${price.toFixed(2)}`);
            return { symbol, price: parseFloat(price.toFixed(2)), error: null };
          } else {
            throw new Error('Invalid price data received from API');
          }
        } else {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          } else {
            throw new Error(`API returned status ${response.status}`);
          }
        }
      } catch (err) {
        const errorMessage = err.message || 'Unable to fetch live prices';
        console.error(`Yahoo Finance failed for ${symbol}:`, errorMessage);
        return { symbol, price: null, error: errorMessage };
      }
    });
    
    const results = await Promise.all(fetchPromises);
    results.forEach(result => {
      if (result.price !== null) {
        prices[result.symbol] = result.price;
      } else {
        errors[result.symbol] = result.error;
      }
    });
    
    return { prices, errors };
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
      const { prices: newPrices, errors } = await this.fetchStockPrices(symbols);
      
      // Update prices map (only for successful fetches)
      Object.keys(newPrices).forEach(symbol => {
        if (newPrices[symbol] > 0) {
          this.prices.set(symbol, newPrices[symbol]);
        }
      });
      
      // Store errors for display
      this.priceErrors = errors;
      
      // Notify all subscribers with prices and errors
      this.priceCallbacks.forEach((callback, accountId) => {
        const accountStocks = this.subscribers.get(accountId) || new Set();
        const accountPrices = {};
        accountStocks.forEach(symbol => {
          accountPrices[symbol] = this.prices.get(symbol);
        });
        callback(accountPrices, errors);
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
      const { prices: newPrices, errors } = await this.fetchStockPrices(symbols);
      Object.keys(newPrices).forEach(symbol => {
        if (newPrices[symbol] > 0) {
          this.prices.set(symbol, newPrices[symbol]);
        }
      });
      // Store errors
      this.priceErrors = { ...this.priceErrors, ...errors };
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

  // Fetch single stock price (for hover/on-demand updates)
  async fetchSingleStockPrice(symbol) {
    try {
      const { prices, errors } = await this.fetchStockPrices([symbol]);
      if (prices[symbol]) {
        this.prices.set(symbol, prices[symbol]);
        return { price: prices[symbol], error: null };
      } else {
        return { price: null, error: errors[symbol] || 'Unable to fetch live price' };
      }
    } catch (error) {
      return { price: null, error: 'Unable to fetch live price' };
    }
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
  const [stockPriceErrors, setStockPriceErrors] = useState({});
  const [accountId, setAccountId] = useState("");
  const [allStockPrices, setAllStockPrices] = useState({});
  const [allStockPriceErrors, setAllStockPriceErrors] = useState({});

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
                (prices, errors) => {
                  setStockPrices(prices);
                  if (errors) {
                    setStockPriceErrors(errors);
                  }
                }
              ).then(initialPrices => {
                setStockPrices(initialPrices);
                setStockPriceErrors(stockPriceService.priceErrors || {});
              }).catch(err => {
                console.error('Failed to subscribe to stocks:', err);
                setStockPrices({});
                setStockPriceErrors({});
              });
            } else {
              setStockPrices({});
              setStockPriceErrors({});
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
        console.log('🔄 Fetching prices for all stocks:', AVAILABLE_STOCKS);
        const { prices, errors } = await stockPriceService.fetchStockPrices(AVAILABLE_STOCKS);
        console.log('✅ Fetched prices:', prices);
        console.log('⚠️ Errors:', errors);
        
        setAllStockPrices(prices);
        setAllStockPriceErrors(errors || {});
        
        // Also update the prices map in the service for future use
        Object.keys(prices).forEach(symbol => {
          if (prices[symbol] > 0) {
            stockPriceService.prices.set(symbol, prices[symbol]);
          }
        });
      } catch (err) {
        console.error('❌ Failed to fetch all stock prices:', err);
      }
    };
    
    // Fetch immediately
    fetchAllPrices();
    // Update prices every 30 seconds for market view
    const interval = setInterval(fetchAllPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Function to fetch single stock price on demand (for hover and subscribed updates)
  const fetchStockPriceOnDemand = async (symbol) => {
    const { price, error } = await stockPriceService.fetchSingleStockPrice(symbol);
    if (price) {
      // Update all stock prices (for Market view)
      setAllStockPrices(prev => ({ ...prev, [symbol]: price }));
      // Update subscribed stock prices if this symbol is subscribed
      if (accountStocks.includes(symbol)) {
        setStockPrices(prev => ({ ...prev, [symbol]: price }));
        setStockPriceErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[symbol];
          return newErrors;
        });
      }
      // Clear error from all stock price errors
      setAllStockPriceErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[symbol];
        return newErrors;
      });
    } else if (error) {
      // Set error for all stock prices
      setAllStockPriceErrors(prev => ({ ...prev, [symbol]: error }));
      // Set error for subscribed stock prices if this symbol is subscribed
      if (accountStocks.includes(symbol)) {
        setStockPriceErrors(prev => ({ ...prev, [symbol]: error }));
      }
    }
  };

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
  const mergedStockPriceErrors = { ...allStockPriceErrors, ...stockPriceErrors };

  return (
    <Dashboard
      user={user}
      currentAccount={currentAccount}
      accountStocks={accountStocks}
      stockPrices={mergedStockPrices}
      stockPriceErrors={mergedStockPriceErrors}
      onSubscribe={handleSubscribe}
      onUnsubscribe={handleUnsubscribe}
      onBuy={handleBuy}
      onSell={handleSell}
      onLogout={handleLogout}
      fetchStockPriceOnDemand={fetchStockPriceOnDemand}
    />
  );
}

export default App;
