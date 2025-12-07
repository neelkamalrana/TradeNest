# TradeNest - Stock Broker Client Web Dashboard

A real-time stock trading dashboard built with React and Vite. This application allows users to manage multiple companies and accounts, subscribe to stocks, track live prices, and execute buy/sell transactions with comprehensive transaction history and statements.

## 🚀 Features

✅ **Multi-User Email Login** - Users can login using their email address  
✅ **Company & Account Management** - Support for multiple companies, each with multiple accounts  
✅ **Stock Subscription** - Subscribe to multiple stocks (GOOG, TSLA, AMZN, META, NVDA)  
✅ **Real-time Price Updates** - Stock prices update every second without page refresh  
✅ **Buy/Sell Functionality** - Execute trades with automatic balance and holdings management  
✅ **Transaction History** - Complete transaction log with profit/loss tracking  
✅ **Statements** - Date-range filtered statements showing buy/sell activity by company, account, and stock  
✅ **Multi-user Support** - Multiple users can have different stock subscriptions  
✅ **Asynchronous Updates** - Each user's dashboard updates independently  

## 📋 Prerequisites

- Node.js (v16 or later)
- npm (comes with Node.js)

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/neelkamalrana/TradeNest.git
   cd TradeNest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
TradeNest/
├── public/
│   ├── companiesData.json    # Companies, accounts, and initial holdings data
│   └── vite.svg              # Vite logo
│
├── src/
│   ├── Components/
│   │   ├── BalanceCard.jsx           # Displays account balance
│   │   ├── Dashboard.jsx             # Main dashboard container
│   │   ├── HeaderControls.jsx        # Company/Account/Stock selection dropdowns
│   │   ├── Login.jsx                 # Email login component
│   │   ├── Sidebar.jsx               # Navigation sidebar
│   │   ├── Statements.jsx            # Statements section with date filtering
│   │   ├── StockCard.jsx             # Individual stock card with buy/sell
│   │   ├── StockSubscription.jsx     # Stock subscription interface
│   │   └── Transactions.jsx          # Transaction history component
│   │
│   ├── assets/
│   │   └── logo.png                  # EazyPayouts logo
│   │
│   ├── App.jsx                       # Main app component with state management
│   ├── App.css                       # Application styles
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Global styles
│
├── .gitignore                        # Git ignore rules
├── eslint.config.js                  # ESLint configuration
├── index.html                        # HTML entry point
├── package.json                      # Dependencies and scripts
├── vite.config.js                    # Vite configuration
└── README.md                         # This file
```

## 🎯 Usage

### Login
- Enter your email address to login
- Each email is treated as a separate user
- Your selections are maintained during the session

### Company & Account Selection
1. Select a **Company** from the dropdown in the top right
2. Select an **Account** from the second dropdown
3. The dashboard will display the account's balance and subscribed stocks

### Stock Management
- **Subscribe**: Select a stock from the third dropdown to subscribe
- **View Prices**: Real-time stock prices update every second
- **Buy Stocks**: Click "Buy" on any stock card, enter quantity, and confirm
- **Sell Stocks**: Click "Sell" on stocks you own, enter quantity, and confirm
- **Unsubscribe**: Click the "×" button on any stock card

### Navigation
- **Loads**: Main dashboard with stock cards and recent transactions
- **Statements**: View aggregated buy/sell data by date range, company, account, and stock
- **Transactions**: View complete transaction history

## 💹 Supported Stocks

- **GOOG** - Google (Alphabet Inc.)
- **TSLA** - Tesla Inc.
- **AMZN** - Amazon.com Inc.
- **META** - Meta Platforms Inc.
- **NVDA** - NVIDIA Corporation

## 📊 Features Details

### Real-time Price Updates
- Prices update every 1 second automatically
- Uses random number generator with ±2% variation per update
- Updates are account-specific and asynchronous

### Buy/Sell Transactions
- **Buy**: Deducts from balance, adds to holdings, calculates weighted average price
- **Sell**: Adds to balance, reduces holdings, calculates profit/loss
- **Validation**: Prevents buying with insufficient funds or selling without holdings
- **Transaction History**: All trades are logged with date, type, quantity, price, total, and P/L

### Statements
- Filter by date range (default: last 30 days)
- Filter by company and/or account
- Shows aggregated data:
  - Buy/Sell counts and quantities
  - Total amounts
  - Net profit/loss per stock
- Summary statistics at the bottom

## 🔧 Technical Details

- **Framework**: React 19
- **Build Tool**: Vite 7
- **State Management**: React Hooks (useState, useEffect)
- **Price Updates**: Custom service using setInterval (updates every 1 second)
- **Data Persistence**: In-memory (resets on refresh)
- **Price Simulation**: Random number generator with ±2% variation per update
- **Styling**: Custom CSS matching EazyPayouts design system

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎨 UI/UX

The application follows the EazyPayouts design system:
- Clean, modern interface
- Left sidebar navigation
- Top-right dropdown controls
- Consistent color scheme (blues, oranges, greens)
- Responsive design for mobile and desktop

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Neelkamal Rana**
- GitHub: [@neelkamalrana](https://github.com/neelkamalrana)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/neelkamalrana/TradeNest/issues).

## 📧 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Note**: Stock prices are simulated using a random number generator. This is a demonstration project and does not use real stock market data.
