import "dotenv/config";

const API_KEY = process.env.OPENAI_API_KEY;

export const apiKeyChecker = () => {
  if (!API_KEY) {
    console.error("API KEY not working");
    process.exit(1);
  }
};

export const checkOpenAI = async () => {
  const openAi = (await import("openai")).default;
  const client = new openAi.OpenAI({
    apiKey: API_KEY,
  });

  if (!client) {
    console.error("Failed to init OPENAI client");
    process.exit(1);
  }

  console.log("OPENAI init successfully");

  return client;
};
