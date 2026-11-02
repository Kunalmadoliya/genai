import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

async function main(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-3.8-flash",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error(error.message);
  }
}

main("Tell me a fun fact about the moon in one sentence.");