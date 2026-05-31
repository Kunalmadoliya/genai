import {checkOpenAI} from "./01-ai";
import readline from "node:readline";

const client = await checkOpenAI();
const model = "gpt-4o-mini";

const askAiQuestion = async (systemPrompt: string, userPrompt: string) => {
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

  return  response.choices[0]?.message.content


  
};



const userPrompt = "Hello my name is kunal"
const rude = await askAiQuestion("" , userPrompt)
const fiendly = await askAiQuestion("You are a senior backend rude developer" , userPrompt)

console.log(fiendly);


