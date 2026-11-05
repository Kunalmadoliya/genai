import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export async function gemini(prompt) {
  const completion = await openai.chat.completions.create({
    model: "gemini-3.5-flash-lite",
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
    stream: true,
  });

  let responseContent = "";
  for await (const chunk of completion) {
    responseContent += chunk.choices[0]?.delta?.content || "";
  }
  return responseContent;
}
