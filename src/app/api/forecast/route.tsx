import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { inventoryData } = await req.json();

    if (!inventoryData || inventoryData.length === 0) {
      return NextResponse.json(
        { error: "No inventory data provided" },
        { status: 400 }
      );
    }

    // Updated prompt to ensure JSON format
    const prompt = `Given this inventory data, predict demand for the next 30 days and provide reorder suggestions.
    Respond ONLY in valid JSON format with an array of objects like this: 
    [{"product_name": "Item A", "current_stocks": 50, "forecasted_demand": 150, "reorder_suggestion": "Reorder 100 units"}]
    You can get the current_stocks from availble data in inventorydata. And product name should be name of inventory data.
    
    Inventory Data: ${JSON.stringify(inventoryData)}`;

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
          temperature: 0.2,
          max_tokens: 300,
        }),
      }
    );

    const data = await openaiRes.json();
    // Ensure response is valid JSON
    let forecast;
    try {
      forecast = JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("ChatGPT response is not valid JSON:", error);
      return NextResponse.json(
        { error: "Invalid JSON response from AI" },
        { status: 500 }
      );
    }

    return NextResponse.json({ forecast });
  } catch (error) {
    console.error("Error fetching forecast:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
