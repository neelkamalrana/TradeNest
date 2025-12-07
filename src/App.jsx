import React, { useState, useEffect } from 'react';
import Login from './Components/Login';
import Dashboard from './Components/Dashboard';
import './App.css';

// Stock price simulator service
class StockPriceService {
  constructor() {
    this.subscribers = new Map(); // Map of accountId -> Set of stock symbols
    this.prices = new Map(); // Map of symbol -> price
    this.basePrices = {
      'GOOG': 150.50,
      'TSLA': 250.75,
      'AMZN': 175.25,
      'META': 485.30,
      'NVDA': 890.45
    };
    this.priceCallbacks = new Map(); // Map of accountId -> callback function
    this.intervalId = null;
    
    // Initialize base prices
    Object.keys(this.basePrices).forEach(symbol => {
      this.prices.set(symbol, this.basePrices[symbol]);
    });
  }

  // Start price updates for all subscribers
  startUpdates() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.updatePrices();
    }, 1000); // Update every second
  }

  // Stop price updates
  stopUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Generate random price update
  updatePrices() {
    const symbols = Array.from(this.prices.keys());
    
    symbols.forEach(symbol => {
      const currentPrice = this.prices.get(symbol);
      const basePrice = this.basePrices[symbol];
      
      // Generate random change between -2% and +2%
      const changePercent = (Math.random() - 0.5) * 4;
      const newPrice = currentPrice * (1 + changePercent / 100);
      
      // Keep price within reasonable bounds (50% to 150% of base)
      const minPrice = basePrice * 0.5;
      const maxPrice = basePrice * 1.5;
      const clampedPrice = Math.max(minPrice, Math.min(maxPrice, newPrice));
      
      this.prices.set(symbol, parseFloat(clampedPrice.toFixed(2)));
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
  }

  // Subscribe account to stocks
  subscribe(accountId, symbols, callback) {
    if (!this.subscribers.has(accountId)) {
      this.subscribers.set(accountId, new Set());
    }
    
    symbols.forEach(symbol => {
      this.subscribers.get(accountId).add(symbol);
    });
    
    this.priceCallbacks.set(accountId, callback);
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

function App() {
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accountStocks, setAccountStocks] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [currentAccount, setCurrentAccount] = useState(null);

  // Fetch companies data on mount
  useEffect(() => {
    fetch("/companiesData.json")
      .then(res => res.json())
      .then(data => {
        setCompanies(data.companies);
      })
      .catch(err => console.error("Failed to load companies data", err));
  }, []);

  // Handle company selection
  const handleCompanyChange = (selectedCompanyId) => {
    setCompanyId(selectedCompanyId);
    setAccountId("");
    setCurrentAccount(null);
    setAccountStocks([]);
    setStockPrices({});
    
    // Unsubscribe previous account
    if (accountId) {
      stockPriceService.unsubscribeAll(accountId);
    }
  };

  // Handle account selection
  const handleAccountChange = (selectedAccountId) => {
    if (!selectedAccountId) return;
    
    // Unsubscribe previous account
    if (accountId) {
      stockPriceService.unsubscribeAll(accountId);
    }
    
    setAccountId(selectedAccountId);
    
    // Find selected account
    const selectedCompany = companies.find(c => c.id === companyId);
    const selectedAccount = selectedCompany?.accounts.find(a => a.id === selectedAccountId);
    
    if (selectedAccount) {
      // Initialize holdings and transactions if they don't exist
      if (!selectedAccount.holdings) {
        selectedAccount.holdings = {};
      }
      if (!selectedAccount.transactions) {
        selectedAccount.transactions = [];
      }
      
      setCurrentAccount({ ...selectedAccount });
      const stocks = selectedAccount.subscribedStocks || [];
      setAccountStocks(stocks);
      
      // Subscribe to stocks for this account
      if (stocks.length > 0) {
        const initialPrices = stockPriceService.subscribe(
          selectedAccountId,
          stocks,
          (prices) => setStockPrices(prices)
        );
        setStockPrices(initialPrices);
      } else {
        setStockPrices({});
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
    setCompanyId("");
    setAccountId("");
    setCurrentAccount(null);
    setAccountStocks([]);
    setStockPrices({});
    localStorage.removeItem('stockDashboardUser');
  };

  // Handle subscribe to new stock
  const handleSubscribe = (symbol) => {
    if (!accountId || !currentAccount) return;
    
    // Update account data
    const selectedCompany = companies.find(c => c.id === companyId);
    const accountIndex = selectedCompany.accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      const updatedStocks = [...new Set([...accountStocks, symbol])];
      selectedCompany.accounts[accountIndex].subscribedStocks = updatedStocks;
      
      setAccountStocks(updatedStocks);
      
      // Subscribe to new stock
      const initialPrices = stockPriceService.subscribe(
        accountId,
        [symbol],
        (prices) => setStockPrices(prev => ({ ...prev, ...prices }))
      );
      setStockPrices(prev => ({ ...prev, ...initialPrices }));
      
      // Update companies state
      setCompanies([...companies]);
    }
  };

  // Handle unsubscribe from stock
  const handleUnsubscribe = (symbol) => {
    if (!accountId) return;
    
    // Update account data
    const selectedCompany = companies.find(c => c.id === companyId);
    const accountIndex = selectedCompany.accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      const updatedStocks = accountStocks.filter(s => s !== symbol);
      selectedCompany.accounts[accountIndex].subscribedStocks = updatedStocks;
      
      setAccountStocks(updatedStocks);
      
      // Unsubscribe from stock
      stockPriceService.unsubscribe(accountId, [symbol]);
      const newPrices = { ...stockPrices };
      delete newPrices[symbol];
      setStockPrices(newPrices);
      
      // Update companies state
      setCompanies([...companies]);
      if (currentAccount) {
        setCurrentAccount({ ...selectedCompany.accounts[accountIndex] });
      }
    }
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
    
    // Update account data
    const selectedCompany = companies.find(c => c.id === companyId);
    const accountIndex = selectedCompany.accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      const account = selectedCompany.accounts[accountIndex];
      
      // Initialize holdings if needed
      if (!account.holdings) {
        account.holdings = {};
      }
      if (!account.transactions) {
        account.transactions = [];
      }
      
      // Update holdings
      if (account.holdings[symbol]) {
        const existingQuantity = account.holdings[symbol].quantity;
        const existingAvgPrice = account.holdings[symbol].avgPrice;
        const totalCostExisting = existingQuantity * existingAvgPrice;
        const newTotalCost = quantity * price;
        const newQuantity = existingQuantity + quantity;
        const newAvgPrice = (totalCostExisting + newTotalCost) / newQuantity;
        
        account.holdings[symbol] = {
          quantity: newQuantity,
          avgPrice: newAvgPrice
        };
      } else {
        account.holdings[symbol] = {
          quantity: quantity,
          avgPrice: price
        };
      }
      
      // Update balance
      account.balance -= totalCost;
      
      // Add transaction
      account.transactions.unshift({
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
      setCompanies([...companies]);
      setCurrentAccount({ ...account });
    }
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
    
    // Update account data
    const selectedCompany = companies.find(c => c.id === companyId);
    const accountIndex = selectedCompany.accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      const account = selectedCompany.accounts[accountIndex];
      const totalRevenue = quantity * price;
      
      // Update holdings
      if (holding.quantity === quantity) {
        // Selling all shares
        delete account.holdings[symbol];
      } else {
        account.holdings[symbol] = {
          quantity: holding.quantity - quantity,
          avgPrice: holding.avgPrice // Keep average price
        };
      }
      
      // Update balance
      account.balance += totalRevenue;
      
      // Calculate profit/loss
      const profitLoss = (price - holding.avgPrice) * quantity;
      
      // Add transaction
      account.transactions.unshift({
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
      setCompanies([...companies]);
      setCurrentAccount({ ...account });
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const selectedCompany = companies.find(c => c.id === companyId);
  const accounts = selectedCompany?.accounts || [];

  return (
    <Dashboard
      user={user}
      companies={companies}
      companyId={companyId}
      setCompanyId={handleCompanyChange}
      accounts={accounts}
      accountId={accountId}
      setAccountId={handleAccountChange}
      currentAccount={currentAccount}
      accountStocks={accountStocks}
      stockPrices={stockPrices}
      onSubscribe={handleSubscribe}
      onUnsubscribe={handleUnsubscribe}
      onBuy={handleBuy}
      onSell={handleSell}
      onLogout={handleLogout}
    />
  );
}

export default App;
