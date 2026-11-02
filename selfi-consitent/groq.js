import "dotenv/config";
import Groq from "groq-sdk";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function main(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log(response.choices[0]?.message?.content || "");
  } catch (error) {
    console.error(error);
  }
}

main("Tell me a fun fact about the moon in one sentence.").catch((error) => {
  console.error(error);
  process.exit(1);
});
