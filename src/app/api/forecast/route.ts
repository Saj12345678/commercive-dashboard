import { NextResponse } from "next/server";

// FIX 9: Improved forecast with mathematical calculations and better AI prompts
export async function POST(req: Request) {
  try {
    const { inventoryData } = await req.json();

    if (!inventoryData || inventoryData.length === 0) {
      return NextResponse.json(
        { error: "No inventory data provided" },
        { status: 400 }
      );
    }

    // Calculate basic metrics for each inventory item
    const enhancedInventory = inventoryData.map((item: any) => {
      const currentStock = item.stockMeter || 0;
      const backorders = item.backorders || 0;

      // Simple heuristic: estimate daily sales based on stock status
      // Low stock items likely sell faster
      let estimatedDailySales = 0;
      if (item.stockStatus === "No Stock") {
        estimatedDailySales = backorders > 0 ? Math.ceil(backorders / 7) : 5;
      } else if (item.stockStatus === "Low Stock") {
        estimatedDailySales = Math.max(1, Math.ceil((50 - currentStock) / 7));
      } else {
        estimatedDailySales = Math.max(1, Math.ceil(currentStock / 30));
      }

      // Calculate 30-day forecast
      const forecastedDemand = estimatedDailySales * 30;
      const reorderAmount = Math.max(0, forecastedDemand - currentStock);

      return {
        product_name: item.name || item.color || "Unknown",
        current_stocks: currentStock,
        daily_sales_rate: estimatedDailySales,
        forecasted_demand: forecastedDemand,
        reorder_suggestion: reorderAmount > 0
          ? `Reorder ${reorderAmount} units`
          : "Stock is sufficient",
        stock_status: item.stockStatus,
      };
    });

    // Try AI enhancement (with fallback to mathematical calculation)
    try {
      const prompt = `Analyze this inventory and refine the demand forecasts.
      Respond ONLY in valid JSON format with an array matching this structure:
      [{"product_name": string, "current_stocks": number, "daily_sales_rate": number, "forecasted_demand": number, "reorder_suggestion": string, "stock_status": string}]

      Current calculations (improve if needed):
      ${JSON.stringify(enhancedInventory, null, 2)}

      Rules:
      1. Keep product_name and current_stocks exact
      2. Adjust daily_sales_rate based on stock_status (Low/No stock = higher sales)
      3. forecasted_demand = daily_sales_rate * 30
      4. Suggest realistic reorder amounts
      5. Return valid JSON only, no markdown`;

      const openaiRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        }
      );

      const data = await openaiRes.json();

      // Parse AI response
      let aiForecast;
      try {
        const content = data.choices[0].message.content.trim();
        // Remove markdown code blocks if present
        const cleanedContent = content.replace(/```json\n?|```\n?/g, '');
        aiForecast = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.warn("AI response not valid JSON, using mathematical forecast");
        aiForecast = enhancedInventory;
      }

      return NextResponse.json({ forecast: aiForecast });
    } catch (aiError) {
      console.warn("AI forecast failed, using mathematical forecast:", aiError);
      // Fallback to mathematical calculation
      return NextResponse.json({ forecast: enhancedInventory });
    }
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
