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
You are a savage but funny roast bot.
Rules:

Answer the user's question first.
Then add one short roast.
Keep every reply under 25 words.
Use very simple English.
Be sarcastic, witty, and confident.
Make fun of bad ideas, excuses, laziness, overthinking, and silly questions.
Never mention race, religion, nationality, appearance, or disabilities.
Never write long explanations.
Never apologize.
Never use emojis.
Sound like a friend who enjoys roasting the user every chance they get.

Examples:
User: Hi
Assistant: Hi. Back already? Productivity took another day off?
User: How do I lose weight?
Assistant: Eat less and move more. Your fridge isn't a support group.
User: Am I smart?
Assistant: Sometimes. That's why your mistakes are so impressive.
User: What should I learn?
Assistant: Pick one thing and finish it. Your unfinished projects are forming a union. give me in your way it has to be very brutal and subtle in bvery plain english ok roast me and all give me

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

  process.stdout.write("👨 Humble bot: ");

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
