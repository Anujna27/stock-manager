// Dashboard page component - main portfolio management interface
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../firebase/auth';
import { getStocks, addStock, deleteStock } from '../firebase/stocks';
import { fetchStockPrice } from '../utils/api';
import {
  calculateInvestedAmount,
  calculateCurrentValue,
  calculateProfitLoss,
  calculateProfitLossPercentage
} from '../utils/calculations';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Add stock form state
  const [ticker, setTicker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [addingStock, setAddingStock] = useState(false);

  const loadStocks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userStocks = await getStocks(user.uid);
      setStocks(userStocks);
    } catch (err) {
      setError('Failed to load stocks: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAllPrices = useCallback(async (stocksToFetch) => {
    if (!stocksToFetch || stocksToFetch.length === 0) return;
    setPricesLoading(true);
    try {
      const updatedStocks = await Promise.all(
        stocksToFetch.map(async (stock) => {
          try {
            const priceData = await fetchStockPrice(stock.ticker);
            return {
              ...stock,
              currentPrice: priceData.price,
              priceError: null
            };
          } catch (err) {
            return {
              ...stock,
              currentPrice: null,
              priceError: err.message
            };
          }
        })
      );
      setStocks(updatedStocks);
    } catch (err) {
      setError('Failed to fetch stock prices');
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // Load stocks from Firestore
  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Fetch prices for all stocks when stocks are first loaded
  useEffect(() => {
    if (stocks.length > 0 && !loading && stocks.every(s => s.currentPrice === undefined && s.priceError === undefined)) {
      fetchAllPrices(stocks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stocks.length, loading]);

  const handleAddStock = async (e) => {
    e.preventDefault();
    setError('');

    if (!ticker || !quantity || !buyPrice) {
      setError('Please fill in all fields');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);

    if (qty <= 0 || price <= 0) {
      setError('Quantity and buy price must be greater than 0');
      return;
    }

    setAddingStock(true);

    try {
      // Verify ticker is valid by fetching price
      await fetchStockPrice(ticker);
      
      await addStock(user.uid, {
        ticker: ticker.toUpperCase().trim(),
        quantity: qty,
        buyPrice: price
      });

      // Reset form
      setTicker('');
      setQuantity('');
      setBuyPrice('');
      
      // Reload stocks
      await loadStocks();
    } catch (err) {
      setError(err.message || 'Failed to add stock. Please check the ticker symbol.');
    } finally {
      setAddingStock(false);
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!window.confirm('Are you sure you want to delete this stock?')) {
      return;
    }

    try {
      await deleteStock(user.uid, stockId);
      await loadStocks();
    } catch (err) {
      setError('Failed to delete stock: ' + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout: ' + err.message);
    }
  };

  // Calculate portfolio totals
  const portfolioTotals = stocks.reduce(
    (acc, stock) => {
      const invested = calculateInvestedAmount(stock.quantity, stock.buyPrice);
      const current = stock.currentPrice
        ? calculateCurrentValue(stock.quantity, stock.currentPrice)
        : 0;
      const profitLoss = stock.currentPrice
        ? calculateProfitLoss(current, invested)
        : 0;

      return {
        invested: acc.invested + invested,
        current: acc.current + current,
        profitLoss: acc.profitLoss + profitLoss
      };
    },
    { invested: 0, current: 0, profitLoss: 0 }
  );

  const portfolioPercentage = portfolioTotals.invested > 0
    ? calculateProfitLossPercentage(portfolioTotals.profitLoss, portfolioTotals.invested)
    : 0;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Stock Portfolio Manager</h1>
        <div className="header-actions">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {/* Portfolio Summary */}
        <section className="portfolio-summary">
          <h2>Portfolio Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Invested</h3>
              <p className="summary-value">
                ${portfolioTotals.invested.toFixed(2)}
              </p>
            </div>
            <div className="summary-card">
              <h3>Current Value</h3>
              <p className="summary-value">
                ${portfolioTotals.current.toFixed(2)}
              </p>
            </div>
            <div className="summary-card">
              <h3>Profit/Loss</h3>
              <p
                className={`summary-value ${
                  portfolioTotals.profitLoss >= 0 ? 'profit' : 'loss'
                }`}
              >
                ${portfolioTotals.profitLoss.toFixed(2)} (
                {portfolioPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>
        </section>

        {/* Add Stock Form */}
        <section className="add-stock-section">
          <h2>Add Stock</h2>
          <form onSubmit={handleAddStock} className="add-stock-form">
            <input
              type="text"
              placeholder="Ticker (e.g., AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              required
              maxLength="10"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
            <input
              type="number"
              placeholder="Buy Price ($)"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              required
              min="0.01"
              step="0.01"
            />
            <button type="submit" disabled={addingStock} className="add-button">
              {addingStock ? 'Adding...' : 'Add Stock'}
            </button>
          </form>
        </section>

        {/* Stocks List */}
        <section className="stocks-section">
          <div className="stocks-header">
            <h2>Your Stocks</h2>
            {pricesLoading && (
              <button onClick={() => fetchAllPrices(stocks)} className="refresh-button" disabled>
                Refreshing...
              </button>
            )}
            {!pricesLoading && stocks.length > 0 && (
              <button onClick={() => fetchAllPrices(stocks)} className="refresh-button">
                Refresh Prices
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading">Loading stocks...</div>
          ) : stocks.length === 0 ? (
            <div className="empty-state">
              <p>No stocks in your portfolio yet. Add your first stock above!</p>
            </div>
          ) : (
            <div className="stocks-table-container">
              <table className="stocks-table">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>Quantity</th>
                    <th>Buy Price</th>
                    <th>Current Price</th>
                    <th>Invested</th>
                    <th>Current Value</th>
                    <th>Profit/Loss</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((stock) => {
                    const invested = calculateInvestedAmount(
                      stock.quantity,
                      stock.buyPrice
                    );
                    const current = stock.currentPrice
                      ? calculateCurrentValue(stock.quantity, stock.currentPrice)
                      : null;
                    const profitLoss = current !== null
                      ? calculateProfitLoss(current, invested)
                      : null;
                    const profitLossPercent = profitLoss !== null && invested > 0
                      ? calculateProfitLossPercentage(profitLoss, invested)
                      : null;

                    return (
                      <tr key={stock.id}>
                        <td className="ticker-cell">{stock.ticker}</td>
                        <td>{stock.quantity}</td>
                        <td>${stock.buyPrice.toFixed(2)}</td>
                        <td>
                          {stock.priceError ? (
                            <span className="error-text">{stock.priceError}</span>
                          ) : stock.currentPrice ? (
                            `$${stock.currentPrice.toFixed(2)}`
                          ) : (
                            <span className="loading-text">Loading...</span>
                          )}
                        </td>
                        <td>${invested.toFixed(2)}</td>
                        <td>
                          {current !== null ? `$${current.toFixed(2)}` : '-'}
                        </td>
                        <td>
                          {profitLoss !== null ? (
                            <span
                              className={
                                profitLoss >= 0 ? 'profit' : 'loss'
                              }
                            >
                              ${profitLoss.toFixed(2)} (
                              {profitLossPercent !== null
                                ? `${profitLossPercent >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%`
                                : '-'}
                              )
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteStock(stock.id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="disclaimer">
          <p>⚠️ Prices may be delayed. For reference only.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

