import {checkOpenAI} from "./01-ai";
import readline from "node:readline";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const talkWithGpt = async (systemPrompt: string, userPrompt: string) => {
  const stream = client.chat.completions.create({
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

  return stream;
};
for await (const chunck of stream) {
  const delta = await chunck.ch;
}

const user = "helloo";

const response = await talkWithGpt("you are the backend developer", user);


rl.question(user , ()=> {
    console.log(response)
})