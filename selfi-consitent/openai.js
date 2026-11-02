import "dotenv/config";
import {OpenAI} from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: "Explain the importance of fast language models",
        },
      ],
    });
    console.log(response.choices[0]?.message?.content || "");
  } catch (error) {
    console.error(error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
