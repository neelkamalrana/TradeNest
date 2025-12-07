# Stock Broker Client Web Dashboard

A real-time stock price tracking dashboard built with React and Vite.

## Features

✅ **Email Login** - Users can login using their email address  
✅ **Stock Subscription** - Subscribe to multiple stocks (GOOG, TSLA, AMZN, META, NVDA)  
✅ **Real-time Price Updates** - Stock prices update every second without page refresh  
✅ **Multi-user Support** - Multiple users can have different stock subscriptions  
✅ **Asynchronous Updates** - Each user's dashboard updates independently  
✅ **Random Price Generator** - Simulated stock prices using random number generator  

## Prerequisites

- Node.js (v16 or later)
- npm (comes with Node.js)

## Installation

1. Navigate to the project directory:
   ```bash
   cd Assignment_02
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

## Usage

### Login
- Enter your email address to login
- Each email is treated as a separate user
- Your subscriptions are saved in browser localStorage

### Subscribe to Stocks
1. Click on stock symbols (GOOG, TSLA, AMZN, META, NVDA) to select them
2. Click "Subscribe" button to add them to your dashboard
3. Stock prices will start updating in real-time (every second)

### Unsubscribe from Stocks
- Click the "×" button on any stock card to unsubscribe
- The stock will be removed from your dashboard

### Multiple Users
- Open the app in multiple browser tabs/windows
- Login with different email addresses
- Each user can subscribe to different stocks
- Updates happen asynchronously for each user

## Technical Details

- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: React Hooks (useState, useEffect)
- **Price Updates**: Custom service using setInterval (updates every 1 second)
- **Data Persistence**: localStorage for user data and subscriptions
- **Price Simulation**: Random number generator with ±2% variation per update

## Project Structure

```
Assignment_02/
├── src/
│   ├── Components/
│   │   ├── Login.jsx          # Login component
│   │   ├── Dashboard.jsx      # Main dashboard container
│   │   ├── StockCard.jsx      # Individual stock card component
│   │   └── StockSubscription.jsx  # Stock subscription interface
│   ├── App.jsx                # Main app component with price service
│   ├── App.css                # Application styles
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js
└── README.md
```

## Supported Stocks

- **GOOG** - Google (Alphabet Inc.)
- **TSLA** - Tesla Inc.
- **AMZN** - Amazon.com Inc.
- **META** - Meta Platforms Inc.
- **NVDA** - NVIDIA Corporation

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

