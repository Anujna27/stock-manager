# Stock Portfolio Manager

A cloud-hosted stock portfolio management web application built with React, Firebase, and Vercel. Track your stock investments, view real-time prices, and monitor your portfolio's performance.

## Features

- 🔐 **Authentication**: Secure signup and login using Firebase Authentication
- 📊 **Portfolio Tracking**: Add and manage multiple stocks with quantity and buy price
- 💰 **Live Prices**: Real-time stock prices fetched from Yahoo Finance
- 📈 **Profit/Loss Calculation**: Automatic calculation of invested amount, current value, and profit/loss for each stock
- 📉 **Portfolio Overview**: Aggregate view of total invested, current value, and overall profit/loss
- 🎨 **Clean UI**: Modern, responsive design with loading states and error handling
- 🔒 **Secure**: Firestore security rules ensure users can only access their own data

## Tech Stack

- **Frontend**: React 18 with Vite
- **Authentication**: Firebase Authentication (Email & Password)
- **Database**: Firebase Firestore
- **Hosting**: Vercel
- **Stock Data**: Yahoo Finance public API
- **State Management**: React Hooks (Context API)

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher) and npm installed
- A Firebase project with Authentication and Firestore enabled
- A Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** with **Email/Password** provider
4. Enable **Firestore Database**
5. Go to Project Settings > General > Your apps
6. Add a web app and copy the Firebase configuration

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Firestore Security Rules

1. Go to Firestore Database > Rules in Firebase Console
2. Copy the contents of `firestore.rules` file
3. Paste and publish the rules in Firebase Console

### 5. Local Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all the `VITE_FIREBASE_*` variables from your `.env` file

### Option 2: Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables in the project settings
6. Deploy

### Important Notes for Deployment

- All environment variables must be prefixed with `VITE_` to be accessible in the browser
- The serverless API endpoint (`/api/getStockPrice`) will automatically be deployed as a Vercel serverless function
- No backend server configuration needed - everything runs serverlessly

## Project Structure

```
stock-portfolio-manager/
├── api/
│   └── getStockPrice.js      # Serverless API endpoint for stock prices
├── src/
│   ├── components/
│   │   └── ProtectedRoute.jsx # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx    # Authentication context provider
│   ├── firebase/
│   │   ├── config.js          # Firebase configuration
│   │   ├── auth.js            # Authentication functions
│   │   └── stocks.js          # Firestore stock operations
│   ├── pages/
│   │   ├── Login.jsx          # Login page
│   │   ├── Signup.jsx         # Signup page
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   ├── Auth.css           # Auth page styles
│   │   └── Dashboard.css     # Dashboard styles
│   ├── utils/
│   │   ├── api.js             # API utility functions
│   │   └── calculations.js   # Portfolio calculation utilities
│   ├── App.jsx                # Main app component with routing
│   ├── App.css                # Global styles
│   └── main.jsx               # Application entry point
├── firestore.rules            # Firestore security rules
├── vercel.json                # Vercel configuration
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies
```

## Database Structure

### Firestore Collections

```
users/
  {userId}/
    stocks/
      {stockId}/
        - ticker: string
        - quantity: number
        - buyPrice: number
        - createdAt: timestamp
```

## API Endpoints

### GET `/api/getStockPrice?ticker=AAPL`

Fetches the current stock price from Yahoo Finance.

**Query Parameters:**
- `ticker` (required): Stock ticker symbol (e.g., AAPL, GOOGL, MSFT)

**Response:**
```json
{
  "ticker": "AAPL",
  "price": 175.50,
  "currency": "USD",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Security

- Firestore security rules ensure users can only access their own data
- Authentication is required for all protected routes
- API keys and sensitive data are stored in environment variables
- Input validation and sanitization on both client and server

## Disclaimer

⚠️ **Prices may be delayed. For reference only.**

This application is for educational and personal use only. Stock prices are fetched from public APIs and may not reflect real-time market data. Do not use this application for making actual investment decisions.

## License

This project is open source and available for personal and educational use.

## Support

For issues or questions, please check the code comments or refer to the documentation of the technologies used:
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

