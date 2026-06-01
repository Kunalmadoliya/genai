import { checkOpenAI } from "./01-ai";
import readline from "node:readline";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const talkWithGpt = async (
  systemPrompt: string,
  userPrompt: string
) => {
  const stream = await client.chat.completions.create({
    model,
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  for await (const chunk of stream) {
    process.stdout.write(
      chunk.choices[0]?.delta?.content || ""
    );
  }

  console.log();
};

rl.question("What is your name? ", async (name) => {
  await talkWithGpt("you are sde", name);
  rl.close();
});

