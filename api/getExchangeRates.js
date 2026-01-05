export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://open.er-api.com/v6/latest/USD"
    );

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Exchange API failed");
    }

    res.status(200).json({
      USD: 1,
      INR: data.rates.INR,
      EUR: data.rates.EUR,
      KRW: data.rates.KRW,
    });
  } catch (error) {
    console.error("Exchange rate error:", error);
    res.status(500).json({ error: "Exchange rate fetch failed" });
  }
}
