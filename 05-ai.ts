import {checkOpenAI} from "./01-ai";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const history: any[] = [];

const askGpt = async (
  systemPrompt: string,
  userPrompt: string,
  conversation: any[],
) => {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {role: "system", content: systemPrompt},
      ...conversation,
      //       ...conversation,    { role: "user", content: "hello my name is kunal" },
      //   { role: "assistant", content: "Hi Kunal!" },
      {role: "user", content: userPrompt},
    ],
  });

  conversation.push({role: "user", content: userPrompt});
  conversation.push({
    role: "assistant",
    content: response.choices[0]?.message.content ?? "",
  });

  console.log(response.usage?.total_tokens);
  return response.choices[0]?.message.content;
};

const user = "hello my name is kunal";
const user2 = "what is my name?";

const first = await askGpt("you are a developer", user, history);
console.log(first);

const second = await askGpt("you are a teacher", user2, history);
console.log(second);
