export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.exchangerate.host/latest?base=USD"
    );
    const data = await response.json();

    res.status(200).json({
      USD: 1,
      INR: data.rates.INR,
      EUR: data.rates.EUR,
      KRW: data.rates.KRW,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch exchange rates" });
  }
}
