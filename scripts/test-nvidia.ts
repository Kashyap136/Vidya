import { nvidiaProvider } from "../src/services/ai/providers/nvidia-provider";

function getApiKey(): string {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) {
    throw new Error(
      "NVIDIA_API_KEY is not set\nUsage: npx tsx --env-file=.env.local scripts/test-nvidia.ts"
    );
  }
  return key;
}

async function main() {
  const apiKey = getApiKey();

  console.log("Testing NVIDIA AI provider...");
  console.log(`API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);
  console.log();

  const prompt = {
    systemInstruction: "You are a helpful assistant. Respond with valid JSON.",
    contents: 'Say "hello" in a JSON object: { "greeting": "..." }',
  };

  try {
    const start = performance.now();
    const result = await nvidiaProvider.generate(prompt);
    const duration = performance.now() - start;

    console.log("Response:", JSON.stringify(result, null, 2));
    console.log(`Time: ${Math.round(duration)}ms`);
    console.log("SUCCESS: NVIDIA provider works!");
  } catch (error) {
    console.error("FAILED:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
