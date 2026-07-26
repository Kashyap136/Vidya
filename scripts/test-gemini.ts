import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_API_KEY!;

async function main() {
  console.log("Testing Gemini API...\n");

  const client = new GoogleGenerativeAI(API_KEY);
  const model = client.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const prompt = `You are a JSON-only response bot. Respond with valid JSON only:
{
  "test": "success",
  "timestamp": "${Date.now()}"
}`;

  try {
    console.log("Sending request with 15s timeout...");
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timed out after 15s")), 15000),
    );

    const result = await Promise.race([
      model.generateContent(prompt),
      timeoutPromise,
    ]);

    const response = result.response;
    const text = response.text();
    console.log("Response received!");
    console.log("Raw text:", text.slice(0, 500));
    console.log("\nFull length:", text.length);

    try {
      const parsed = JSON.parse(text);
      console.log("JSON parsed:", JSON.stringify(parsed, null, 2));
    } catch {
      console.log("Not valid JSON");
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    console.error("ERROR:", msg);
    if (stack) console.error("Stack:", stack.split("\n").slice(0, 3).join("\n"));
  }
}

main();
