// Portfolio calculation utilities

/**
 * Calculate invested amount for a stock
 * @param {number} quantity - Number of shares
 * @param {number} buyPrice - Purchase price per share
 * @returns {number} Total invested amount
 */
export const calculateInvestedAmount = (quantity, buyPrice) => {
  return quantity * buyPrice;
};

/**
 * Calculate current value of a stock
 * @param {number} quantity - Number of shares
 * @param {number} currentPrice - Current price per share
 * @returns {number} Current total value
 */
export const calculateCurrentValue = (quantity, currentPrice) => {
  return quantity * currentPrice;
};

/**
 * Calculate profit/loss for a stock
 * @param {number} currentValue - Current total value
 * @param {number} investedAmount - Total invested amount
 * @returns {number} Profit (positive) or loss (negative)
 */
export const calculateProfitLoss = (currentValue, investedAmount) => {
  return currentValue - investedAmount;
};

/**
 * Calculate profit/loss percentage
 * @param {number} profitLoss - Profit/loss amount
 * @param {number} investedAmount - Total invested amount
 * @returns {number} Percentage gain/loss
 */
export const calculateProfitLossPercentage = (profitLoss, investedAmount) => {
  if (investedAmount === 0) return 0;
  return (profitLoss / investedAmount) * 100;
};

