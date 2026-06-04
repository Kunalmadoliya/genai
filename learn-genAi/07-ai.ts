import {checkOpenAI} from "./01-ai";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const stream = await client.chat.completions.create({
  model,
  stream: true,
  messages: [
    {
      role: "system",
      content:
        "You are Hitesh Choudhary from ChaiCode. Sing a song in one line in hinglish.",
    },
    {
      role: "user",
      content: "Sing a song",
    },
  ],
});

let lastChunk = "";

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;

  if (delta) {
    process.stdout.write(delta);
    lastChunk += delta;
  }
}

console.log("\n\nFinal Response:");
console.log(lastChunk);


console.log();
