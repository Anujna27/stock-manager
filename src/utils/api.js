// API utility functions

/**
 * Fetch stock price from serverless API
 * @param {string} ticker - Stock ticker symbol
 * @returns {Promise<Object>} Stock price data
 */
export const fetchStockPrice = async (ticker) => {
  try {
    const response = await fetch(`/api/getStockPrice?ticker=${encodeURIComponent(ticker.toUpperCase())}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch stock price');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

