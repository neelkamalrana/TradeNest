# TradeNest - Professional Stock Trading Platform

**TradeNest** is a comprehensive, real-time stock trading dashboard designed for modern investors and traders. Built with a focus on user experience and professional-grade functionality, TradeNest provides an intuitive interface for tracking stocks, managing portfolios, and executing trades with live market data.

## 🎯 Business Value

TradeNest empowers users to make informed trading decisions through real-time market data, comprehensive portfolio management, and detailed transaction analytics. Whether you're a day trader monitoring multiple positions or a long-term investor tracking your holdings, TradeNest provides the tools you need to manage your investments effectively.

### Key Business Benefits

- **Real-Time Market Intelligence**: Access live stock prices from major exchanges, updated every 10 seconds
- **Portfolio Management**: Track your holdings, average purchase prices, and unrealized profit/loss across all positions
- **Transaction Analytics**: Comprehensive transaction history with profit/loss tracking for every trade
- **Market Research**: Browse and subscribe to 20+ major stocks across technology, finance, consumer goods, and more
- **Performance Insights**: Detailed statements and summaries to analyze your trading performance over time

## ✨ Core Features

### 📈 Market Section
Browse the entire stock market with real-time prices for 20+ major stocks. Subscribe to stocks you want to track, and they'll appear in your subscribed stocks section. Each stock card displays:
- Current market price
- Price change indicators (up/down with percentage)
- One-click subscription

### 👁️ Subscribed Stocks
Your personal watchlist of stocks you're tracking. This section allows you to:
- View all subscribed stocks in an organized grid layout
- Monitor real-time price updates
- Execute buy/sell orders directly
- Manage your subscriptions

### 💼 Portfolio
Your investment portfolio showing only stocks you actually own. Features include:
- Holdings overview with quantity and average purchase price
- Real-time portfolio value calculation
- Unrealized profit/loss tracking
- Individual stock performance metrics
- Quick buy/sell actions

### 📊 Statements
Comprehensive trading statements with advanced filtering:
- Date range filtering (customizable)
- Aggregated buy/sell statistics
- Net profit/loss calculations per stock
- Summary statistics including total transactions, quantities, and amounts

### 💰 Transactions
Complete transaction history with:
- All buy and sell orders
- Transaction dates and timestamps
- Price and quantity details
- Profit/loss calculations for sell orders
- Color-coded transaction types

### 💵 Balance Management
- Real-time account balance tracking
- Automatic balance updates on buy/sell
- Insufficient funds validation
- Transaction cost calculations

## 📱 User Experience

### Intuitive Navigation
- **Sidebar Navigation**: Quick access to all major sections
- **Dark Theme**: Professional dark UI designed to reduce eye strain during extended trading sessions
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-Time Updates**: Live price updates without page refreshes

### Trading Workflow
1. **Discover**: Browse the Market section to find stocks of interest
2. **Subscribe**: Add stocks to your watchlist for easy tracking
3. **Analyze**: Monitor price movements and market trends
4. **Trade**: Execute buy/sell orders with real-time price validation
5. **Track**: Review your portfolio performance and transaction history

## 🏢 Supported Stocks

TradeNest supports trading for 20+ major stocks across multiple sectors:

**Technology**: GOOG (Google), AAPL (Apple), MSFT (Microsoft), META (Meta), NVDA (NVIDIA), NFLX (Netflix), AMD, INTC

**Finance**: JPM (JPMorgan Chase), V (Visa), MA (Mastercard)

**Consumer**: AMZN (Amazon), TSLA (Tesla), DIS (Disney), NKE (Nike), WMT (Walmart), KO (Coca-Cola), PEP (PepsiCo)

**Healthcare & Consumer Goods**: JNJ (Johnson & Johnson), PG (Procter & Gamble)

## 📈 Portfolio Analytics

### Holdings Information
For each stock in your portfolio, TradeNest displays:
- **Quantity**: Number of shares owned
- **Average Price**: Weighted average of all purchase prices
- **Total Value**: Current market value of your holdings
- **Profit/Loss**: Unrealized gain or loss based on current market price
- **P/L Percentage**: Percentage gain or loss on your investment

### Transaction Tracking
Every transaction is automatically recorded with:
- Transaction type (Buy/Sell)
- Stock symbol and quantity
- Execution price
- Total transaction value
- Profit/loss (for sell orders)
- Timestamp

## 🔒 Data & Security

- **Session Management**: User sessions maintained through browser storage
- **Real-Time Validation**: Prevents invalid trades (insufficient funds, insufficient shares)
- **Transaction Integrity**: All trades are validated before execution
- **Data Accuracy**: Real-time price feeds ensure accurate trading decisions

## 🎨 Design Philosophy

TradeNest features a modern, professional dark theme designed for:
- **Reduced Eye Strain**: Dark backgrounds for extended use
- **Clear Information Hierarchy**: Important data stands out with strategic color coding
- **Intuitive Interactions**: Simple, one-click actions for common tasks
- **Visual Feedback**: Color-coded profit/loss indicators (green for gains, red for losses)
- **Responsive Layout**: Adapts to different screen sizes while maintaining functionality

---

## 🛠️ Technical Stack

### Frontend Framework
- **React 19.2.0** - Modern UI library for building interactive user interfaces
- **Vite 7.2.2** - Next-generation frontend build tool for fast development and optimized production builds

### Styling & UI
- **Tailwind CSS 4.1.17** - Utility-first CSS framework for rapid UI development
- **PostCSS** - CSS processing with autoprefixer for cross-browser compatibility
- **Custom Dark Theme** - Professional dark color scheme with slate-based palette

### Icons & Assets
- **React Icons 5.5.0** - Comprehensive icon library (Font Awesome, Ionicons)

### State Management
- **React Hooks** - useState, useEffect for component state and side effects
- **Local Storage** - Browser-based session persistence

### API Integration
- **Yahoo Finance API** - Primary source for real-time stock price data
- **Finnhub API** - Fallback API for stock price data (with demo key support)
- **Fetch API** - Native browser API for HTTP requests

### Development Tools
- **ESLint 9.39.1** - Code linting and quality assurance
- **ESLint React Plugins** - React-specific linting rules
- **TypeScript Types** - Type definitions for React and React DOM

### Build & Deployment
- **Vite Build System** - Optimized production builds
- **ES Modules** - Modern JavaScript module system
- **Hot Module Replacement** - Instant updates during development

### Browser Support
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)

### Architecture
- **Component-Based Architecture** - Modular, reusable React components
- **Service-Oriented Design** - StockPriceService for centralized price management
- **Singleton Pattern** - Single instance of price service across the application
- **Real-Time Updates** - Interval-based price fetching (10-second updates)

### Data Flow
- **Unidirectional Data Flow** - React's one-way data binding
- **Props & State Management** - Component communication through props
- **Callback Functions** - Event handling and state updates

### Performance Optimizations
- **Lazy Loading** - Components loaded on demand
- **Efficient Re-renders** - React's virtual DOM for optimal updates
- **API Rate Limiting** - 10-second intervals to respect API limits
- **Parallel API Calls** - Concurrent fetching for multiple stocks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Neelkamal Rana**
- GitHub: [@neelkamalrana](https://github.com/neelkamalrana)

---

**Note**: TradeNest uses real-time stock market data from Yahoo Finance and Finnhub APIs. All prices are live and reflect current market conditions.
