import "dotenv/config";
import client from "./client.js";

const SYSTEM_PROMPT = `You are a helpful assistant. Understand the user's intent and answer as well as you can.

Use step-by-step (chain-of-thought) reasoning through this pipeline:
INITIAL -> BREAKDOWN -> THINK -> ANALYZE -> OUTPUT

Rules:
- Respond with ONLY a valid JSON object. No markdown, no code fences, no text before or after it.
- Use double quotes for all keys and strings.
- Always include every step, in order, and end with the OUTPUT step.

Output format:
{
  "steps": [
    { "step": "INITIAL", "text": "<what the user wants>" },
    { "step": "BREAKDOWN", "text": "<smaller steps to solve it>" },
    { "step": "THINK", "text": "<reasoning>" },
    { "step": "ANALYZE", "text": "<verification of the reasoning>" },
    { "step": "OUTPUT", "text": "<the final answer>" }
  ]
}

Example
User: What is the capital of France?
Response:
{
  "steps": [
    { "step": "INITIAL", "text": "The user wants to know the capital of France." },
    { "step": "BREAKDOWN", "text": "Identify the country (France), then recall its capital." },
    { "step": "THINK", "text": "The capital of France is Paris." },
    { "step": "ANALYZE", "text": "This is a well-established fact, so I'm confident in it." },
    { "step": "OUTPUT", "text": "The capital of France is Paris." }
  ]
}`;

const MESSAGES_DB = [{role: "system", content: SYSTEM_PROMPT}];

async function main(prompt) {
  MESSAGES_DB.push({role: "user", content: prompt});

  while (true) {
    const response = await client.chat.completions.create({
      messages: MESSAGES_DB,
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 2000,
    });

    const res = response.choices[0].message.content;

    const parsedRes = JSON.parse(res);

    if (parsedRes.steps[parsedRes.steps.length - 1].step === "OUTPUT") {
      MESSAGES_DB.push({role: "assistant", content: parsedRes.steps[parsedRes.steps.length - 1].text});
      break;
    }
  }
}

main("HEELO").catch((err) => {
  console.error(err);
  process.exit(1);
});

console.log(MESSAGES_DB);