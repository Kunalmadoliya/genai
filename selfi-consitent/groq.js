import "dotenv/config";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function groqClient(prompt) {
  try {
    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });

    let responseContent = "";

    for await (const chunk of stream) {
     responseContent += chunk.choices[0]?.delta?.content || "";
    }
    return responseContent;
  } catch (error) {
    console.error(error);
  }
}

