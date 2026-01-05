// Serverless API endpoint to fetch stock prices from Yahoo Finance
// This endpoint runs on Vercel serverless functions

/**
 * Fetch stock price from Yahoo Finance
 * Uses Yahoo Finance public API endpoint
 * 
 * @param {Object} req - Vercel request object
 * @param {Object} res - Vercel response object
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get ticker from query parameters
  const { ticker } = req.query;

  // Validate ticker parameter
  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  // Sanitize ticker (only allow alphanumeric and dots)
  const sanitizedTicker = ticker.replace(/[^a-zA-Z0-9.]/g, '').toUpperCase();

  if (!sanitizedTicker) {
    return res.status(400).json({ error: 'Invalid ticker symbol' });
  }

  try {
    // Yahoo Finance API endpoint
    // Using the quote endpoint which provides current price
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sanitizedTicker}?interval=1d&range=1d`;

    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned status ${response.status}`);
    }

    const data = await response.json();

    // Extract price from Yahoo Finance response
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid ticker symbol or no data available');
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    if (!meta || meta.regularMarketPrice === undefined) {
      throw new Error('Price data not available for this ticker');
    }

    const price = meta.regularMarketPrice;

    // Return successful response with caching headers
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({
      ticker: sanitizedTicker,
      price: price,
      currency: meta.currency || 'USD',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Handle errors gracefully
    console.error('Error fetching stock price:', error);

    // Return user-friendly error message
    return res.status(500).json({
      error: error.message || 'Failed to fetch stock price. Please check the ticker symbol and try again.',
    });
  }
}

