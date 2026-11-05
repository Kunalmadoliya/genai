import { gemini } from "./gemini.js";
import { groqClient } from "./groq.js";
import { openai } from "./openai.js";
import {SYSTEM_PROMPT} from "./system_prompt.js";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});



async function aiResponses(prompt) {
  const [geminiResponse, groqResponse, openaiResponse] = await Promise.all([
    gemini(prompt),
    groqClient(prompt),
    openai(prompt),
  ]);

  return {
    gemini: geminiResponse,
    groq: groqResponse,
    openai: openaiResponse,
  };
}

async function compete(prompt) {
  const responses = await aiResponses(prompt);

  const evaluationPrompt = `
${SYSTEM_PROMPT}

USER PROMPT:
${prompt}

MODEL RESPONSES:
${Object.entries(responses)
  .map(([model, response]) => `${model.toUpperCase()}:\n${response}`)
  .join("\n\n")}

Evaluate all responses based on:
1. Factual correctness
2. Relevance to the user prompt
3. Completeness
4. Instruction following

Identify agreements and disagreements.

Select the most accurate answer. If multiple answers are equally
correct, combine their useful information.

Return:
- Individual model scores (0-10)
- Common points
- Disagreements
- Selected final answer
`;

  const evaluationResponse = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: evaluationPrompt,
      },
    ],
    temperature: 0.2,
  });

  console.log("Evaluation:", evaluationResponse.choices[0].message.content);

}

compete("Explain RAG in only 2 lines").catch((error) => {
  console.error("Error during competition:", error);
  process.exit(1);
});