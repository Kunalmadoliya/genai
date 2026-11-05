import "dotenv/config";
import {OpenAI} from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function openai(prompt) {
  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      stream: true,
    });
  
    let responseContent = "";
    for await (const chunk of response) {
      responseContent += chunk.choices[0]?.delta?.content || "";
    }
    return responseContent;
  } catch (error) {
    console.error(error);
  }
}

