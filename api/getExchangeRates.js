export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();

    if (data.result !== "success") {
      throw new Error("Exchange API returned failure");
    }

    return new Response(
      JSON.stringify({
        USD: 1,
        INR: data.rates.INR,
        EUR: data.rates.EUR,
        KRW: data.rates.KRW,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Exchange rate error:", error);

    return new Response(
      JSON.stringify({ error: "Exchange rate fetch failed" }),
      { status: 500 }
    );
  }
}
