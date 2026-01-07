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

  // Add stock form
  const [ticker, setTicker] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [addingStock, setAddingStock] = useState(false);

  // Currency
  const [currency, setCurrency] = useState("USD");
  const [rates, setRates] = useState({});

  const currencySymbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    KRW: "₩",
  };

  // conversion helpers
  const rate = currency === "USD" ? 1 : rates[currency];
  const convertToDisplay = (value) =>
    rate ? (value * rate).toFixed(2) : "Loading...";

  // ---------------- LOAD DATA ----------------

  const loadStocks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getStocks(user.uid);
      setStocks(data);
    } catch {
      setError("Failed to load stocks");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAllPrices = useCallback(async (list) => {
    if (!list.length) return;
    setPricesLoading(true);
    try {
      const updated = await Promise.all(
        list.map(async (stock) => {
          try {
            const priceData = await fetchStockPrice(stock.ticker);
            return { ...stock, currentPrice: priceData.price };
          } catch {
            return { ...stock, currentPrice: null };
          }
        })
      );
      setStocks(updated);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    if (!loading && stocks.length) {
      fetchAllPrices(stocks);
    }
  }, [loading]);

  useEffect(() => {
    fetchExchangeRates().then(setRates).catch(() => {});
  }, []);

  // ---------------- ACTIONS ----------------

  const handleAddStock = async (e) => {
    e.preventDefault();
    setError("");

    if (!ticker || !quantity || !buyPrice) {
      setError("Please fill in all fields");
      return;
    }

    const qty = parseFloat(quantity);
    const enteredPrice = parseFloat(buyPrice);

    if (qty <= 0 || enteredPrice <= 0) {
      setError("Quantity and buy price must be greater than 0");
      return;
    }

    if (currency !== "USD" && !rates[currency]) {
      setError("Exchange rates not loaded yet");
      return;
    }

    // 🔑 convert selected currency → USD
    const priceInUSD =
      currency === "USD"
        ? enteredPrice
        : enteredPrice / rates[currency];

    setAddingStock(true);
    try {
      await fetchStockPrice(ticker); // validate ticker

      await addStock(user.uid, {
        ticker: ticker.toUpperCase().trim(),
        quantity: qty,
        buyPrice: priceInUSD, // STORED IN USD
      });

      setTicker("");
      setQuantity("");
      setBuyPrice("");
      await loadStocks();
    } catch {
      setError("Failed to add stock");
    } finally {
      setAddingStock(false);
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Delete this stock?")) return;
    await deleteStock(user.uid, id);
    await loadStocks();
  };

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  // ---------------- CALCULATIONS ----------------

  const portfolioTotals = stocks.reduce(
    (acc, s) => {
      const invested = calculateInvestedAmount(s.quantity, s.buyPrice);
      const current = s.currentPrice
        ? calculateCurrentValue(s.quantity, s.currentPrice)
        : 0;
      return {
        invested: acc.invested + invested,
        current: acc.current + current,
        profitLoss: acc.profitLoss + (current - invested),
      };
    },
    { invested: 0, current: 0, profitLoss: 0 }
  );

  const portfolioPercent =
    portfolioTotals.invested > 0
      ? calculateProfitLossPercentage(
          portfolioTotals.profitLoss,
          portfolioTotals.invested
        )
      : 0;

  // ---------------- UI ----------------

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Stock Portfolio Manager</h1>
        <div className="header-actions">
          <span>{user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        {/* Portfolio Summary */}
        <section className="portfolio-summary">
          <h2>Portfolio Summary</h2>

          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD ($)</option>
            <option value="INR">INR (₹)</option>
            <option value="EUR">EUR (€)</option>
            <option value="KRW">KRW (₩)</option>
          </select>

          <div className="summary-cards">
            <div>
              <h3>Total Invested</h3>
              <p>
                {currencySymbols[currency]}{" "}
                {convertToDisplay(portfolioTotals.invested)}
              </p>
            </div>
            <div>
              <h3>Current Value</h3>
              <p>
                {currencySymbols[currency]}{" "}
                {convertToDisplay(portfolioTotals.current)}
              </p>
            </div>
            <div>
              <h3>Profit / Loss</h3>
              <p
                className={
                  portfolioTotals.profitLoss >= 0 ? "profit" : "loss"
                }
              >
                {currencySymbols[currency]}{" "}
                {convertToDisplay(portfolioTotals.profitLoss)} (
                {portfolioPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </section>

        {/* Add Stock */}
        <section className="add-stock-section">
          <h2>Add Stock ({currency})</h2>
          <form onSubmit={handleAddStock}>
            <input
              placeholder="Ticker (e.g. AAPL)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <input
              type="number"
              placeholder={`Buy Price (${currency})`}
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
            <button disabled={addingStock}>
              {addingStock ? "Adding..." : "Add Stock"}
            </button>
          </form>
        </section>

        {/* Stocks Table */}
        <table className="stocks-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Qty</th>
              <th>Buy</th>
              <th>Current</th>
              <th>Invested</th>
              <th>Value</th>
              <th>P/L</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {stocks.map((s) => {
              const invested = calculateInvestedAmount(
                s.quantity,
                s.buyPrice
              );
              const current = s.currentPrice
                ? calculateCurrentValue(s.quantity, s.currentPrice)
                : 0;
              const pl = current - invested;

              return (
                <tr key={s.id}>
                  <td>{s.ticker}</td>
                  <td>{s.quantity}</td>
                  <td>
                    {currencySymbols[currency]}{" "}
                    {convertToDisplay(s.buyPrice)}
                  </td>
                  <td>
                    {s.currentPrice
                      ? `${currencySymbols[currency]} ${convertToDisplay(
                          s.currentPrice
                        )}`
                      : "-"}
                  </td>
                  <td>
                    {currencySymbols[currency]}{" "}
                    {convertToDisplay(invested)}
                  </td>
                  <td>
                    {currencySymbols[currency]}{" "}
                    {convertToDisplay(current)}
                  </td>
                  <td className={pl >= 0 ? "profit" : "loss"}>
                    {currencySymbols[currency]}{" "}
                    {convertToDisplay(pl)}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteStock(s.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Dashboard;
