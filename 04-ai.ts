import {checkOpenAI} from "./01-ai";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const askAiGpt = async (systemPrompt: string, userPrompt: string) => {
  const response = await client.chat.completions.create({
    model,
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

  return response.choices[0]?.message.content;
};

const userPrompt = "waht is node";

console.log("+++++++++friendly++++++++");

const checking = await askAiGpt(
  "You are rude and brutally very baaad at speaing give me only one line",
  userPrompt,
);


console.log(checking);
