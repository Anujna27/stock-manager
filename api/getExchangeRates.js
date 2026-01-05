export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.exchangerate.host/latest?base=USD"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from exchange API");
    }

    const data = await response.json();

    res.status(200).json({
      USD: 1,
      INR: data.rates.INR,
      EUR: data.rates.EUR,
      KRW: data.rates.KRW,
    });
  } catch (error) {
    console.error("Exchange API error:", error);
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
}
