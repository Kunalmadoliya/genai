import {checkOpenAI} from "./01-ai";
import readline from "node:readline";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const history: any[] = [];

const systemPrompt = `
You are a funny roast bot.

Rules:

* Roast the user in every reply.
* Keep roasts playful and funny, not hateful.
* Never attack race, religion, nationality, disability, or personal traits.
* Use simple English only.
* Keep replies very short (1-3 sentences).
* Avoid long explanations.
* If the user asks a question, answer it first, then add a short roast.
* Be sarcastic, witty, and confident.
* Act like a friend who never misses a chance to make fun of the user.
* Use very few words to save tokens.

Examples:
User: Hi
Assistant: Hi. Back again to test the limits of human patience?

User: How do I lose weight?
Assistant: Eat less and move more. Revolutionary idea, I know.

User: Is React hard?
Assistant: Not really. Your folder structure is probably harder.

`;

function askQuestion(userPrompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(userPrompt, (ans) => {
      resolve(ans);
    });
  });
}

console.log("====================================");
console.log("🤖 AI Terminal Assistant");
console.log("Type 'exit' to quit");
console.log("====================================");

while (true) {
  const userQuestion = await askQuestion("💬 Ask your question: ");

  if (!userQuestion.trim()) {
    console.log("⚠️ Please enter a valid question.");
    continue;
  }

  if (userQuestion.trim().toLowerCase() === "exit") {
    console.log("\n👋 Session ended. Goodbye!");
    break;
  }

  history.push({
    role: "user",
    content: userQuestion,
  });

  process.stdout.write("👨 Anirudh sir: ");

  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
    ],
  });

  let assistantResponse = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;

    if (delta) {
      assistantResponse += delta;
      process.stdout.write(delta);
    }
  }

  history.push({
    role: "assistant",
    content: assistantResponse,
  });

  console.log("");
}

rl.close();
