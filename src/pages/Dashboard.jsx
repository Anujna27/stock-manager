// Dashboard page component - main portfolio management interface
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logOut } from "../firebase/auth";
import { getStocks, addStock, deleteStock } from "../firebase/stocks";
import { fetchStockPrice, fetchExchangeRates } from "../utils/api";
import {
  calculateInvestedAmount,
  calculateCurrentValue,
  calculateProfitLoss,
  calculateProfitLossPercentage,
} from "../utils/calculations";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState("");

  // Add stock form state
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [addingStock, setAddingStock] = useState(false);

  // Currency state
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});

  const currencySymbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    KRW: "₩",
  };

 const rate =
  currency === "USD"
    ? 1
    : rates[currency]
    ? rates[currency]
    : null;


  const loadStocks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userStocks = await getStocks(user.uid);
      setStocks(userStocks);
    } catch (err) {
      setError("Failed to load stocks: " + err.message);
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
            return { ...stock, currentPrice: priceData.price, priceError: null };
          } catch (err) {
            return { ...stock, currentPrice: null, priceError: err.message };
          }
        })
      );
      setStocks(updatedStocks);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // Load stocks
  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  // Fetch prices once
  useEffect(() => {
    if (
      stocks.length > 0 &&
      !loading &&
      stocks.every(
        (s) => s.currentPrice === undefined && s.priceError === undefined
      )
    ) {
      fetchAllPrices(stocks);
    }
  }, [stocks.length, loading, fetchAllPrices]);

  // Fetch exchange rates
  useEffect(() => {
    fetchExchangeRates()
      .then(setRates)
      .catch((err) => console.error("Exchange rate error:", err));
  }, []);

  
  useEffect(() => {
  console.log("Rates fetched:", rates);
  console.log("Selected currency:", currency);
  console.log("Current rate:", rates[currency]);
}, [rates, currency]);


  const handleAddStock = async (e) => {
    e.preventDefault();
    setError("");

    if (!ticker || !quantity || !buyPrice) {
      setError("Please fill in all fields");
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(buyPrice);

    if (qty <= 0 || price <= 0) {
      setError("Quantity and buy price must be greater than 0");
      return;
    }

    setAddingStock(true);
    try {
      await fetchStockPrice(ticker);
      await addStock(user.uid, {
        ticker: ticker.toUpperCase().trim(),
        quantity: qty,
        buyPrice: price,
      });
      setTicker("");
      setQuantity("");
      setBuyPrice("");
      await loadStocks();
    } catch (err) {
      setError(err.message || "Failed to add stock");
    } finally {
      setAddingStock(false);
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!window.confirm("Delete this stock?")) return;
    await deleteStock(user.uid, stockId);
    await loadStocks();
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  // Portfolio totals (USD base)
  const portfolioTotals = stocks.reduce(
    (acc, stock) => {
      const invested = calculateInvestedAmount(stock.quantity, stock.buyPrice);
      const current = stock.currentPrice
        ? calculateCurrentValue(stock.quantity, stock.currentPrice)
        : 0;
      const profitLoss = calculateProfitLoss(current, invested);
      return {
        invested: acc.invested + invested,
        current: acc.current + current,
        profitLoss: acc.profitLoss + profitLoss,
      };
    },
    { invested: 0, current: 0, profitLoss: 0 }
  );

  const portfolioPercentage =
    portfolioTotals.invested > 0
      ? calculateProfitLossPercentage(
          portfolioTotals.profitLoss,
          portfolioTotals.invested
        )
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
          

          {/* Currency Selector */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ marginRight: "8px" }}>Currency:</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
              <option value="EUR">EUR (€)</option>
              <option value="KRW">KRW (₩)</option>
            </select>
          </div>

          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Invested</h3>
              <p className="summary-value">
  {currencySymbols[currency]}{" "}
  {rate === null
    ? "Loading..."
    : (portfolioTotals.invested * rate).toFixed(2)}
</p>

            </div>

            <div className="summary-card">
              <h3>Current Value</h3>
              <p className="summary-value">
                {currencySymbols[currency]}{" "}
{rate === null
  ? "Loading..."
  : (portfolioTotals.current * rate).toFixed(2)}

              </p>
            </div>

            <div className="summary-card">
              <h3>Profit / Loss</h3>
              <p
                className={`summary-value ${
                  portfolioTotals.profitLoss >= 0 ? "profit" : "loss"
                }`}
              >
               {currencySymbols[currency]}{" "}
{rate === null
  ? "Loading..."
  : (portfolioTotals.profitLoss * rate).toFixed(2)}
 (
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
      placeholder="Buy Price (USD)"
      value={buyPrice}
      onChange={(e) => setBuyPrice(e.target.value)}
      required
      min="0.01"
      step="0.01"
    />
    <button type="submit" disabled={addingStock} className="add-button">
      {addingStock ? "Adding..." : "Add Stock"}
    </button>
  </form>
</section>


        {/* Stocks Table */}
        <section className="stocks-section">
          <div className="stocks-header">
            <h2>Your Stocks</h2>
            <button
              onClick={() => fetchAllPrices(stocks)}
              className="refresh-button"
              disabled={pricesLoading}
            >
              {pricesLoading ? "Refreshing..." : "Refresh Prices"}
            </button>
          </div>

          <table className="stocks-table">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Qty</th>
                <th>Buy Price</th>
                <th>Current Price</th>
                <th>Invested</th>
                <th>Current Value</th>
                <th>Profit/Loss</th>
                <th />
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
                  : 0;
                const profitLoss = calculateProfitLoss(current, invested);

                return (
                  <tr key={stock.id}>
                    <td>{stock.ticker}</td>
                    <td>{stock.quantity}</td>
                    <td>
                      {currencySymbols[currency]}{" "}
{rate === null ? "Loading..." : (stock.buyPrice * rate).toFixed(2)}

                    </td>
                    <td>
                      {stock.currentPrice
                        ? `${currencySymbols[currency]} ${(
                            stock.currentPrice * rate
                          ).toFixed(2)}`
                        : "-"}
                    </td>
                    <td>
                      {currencySymbols[currency]}{" "}
{rate === null ? "Loading..." : (invested * rate).toFixed(2)}


                    </td>
                    <td>
                      {currencySymbols[currency]}{" "}
{rate === null ? "Loading..." : (current * rate).toFixed(2)}

                    </td>
                    <td
                      className={profitLoss >= 0 ? "profit" : "loss"}
                    >
                     {currencySymbols[currency]}{" "}
{rate === null ? "Loading..." : (profitLoss * rate).toFixed(2)}

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
        </section>

        <div className="disclaimer">
          ⚠️ Prices may be delayed. For reference only.
        </div>
      </main>
    </div>
  );
};

export default Dashboard;



