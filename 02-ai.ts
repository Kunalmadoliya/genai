import {checkOpenAI} from "./01-ai";

const client = await checkOpenAI();
const model = "gpt-40-mini";

console.log(client.baseURL);

const response = await client.chat.completions.create({
  model,
  messages: [
    {
      role: "system",
      content: "You are a drunk man speak with me",
    },
    {
      role: "user",
      content: "hi",
    },
  ],
});

console.log(response.choices[0]?.message.content);

const usage_stats = {
  prompt_tokens: response.usage?.prompt_tokens,
  completion_tokens: response.usage?.completion_tokens,
  total_tokens: response.usage?.total_tokens,
};


console.table (usage_stats);
