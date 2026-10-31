import client from "./client.js";

async function main() {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `You are a helpful assistant. 
        `,
      },
      {
        role: "user",
        content: `
        what is 8 + 9 equals
        you have to help a user if user asking anything reply like this
        example : 
         -what is the addition of 2 and 3
         -The addition of 2 + 3 = 5

         -what is the subtraction of 5 and 3
         -The subtraction of 5 - 3 = 2`,
      },
    ],
  });
  console.log(response.output_text);
}

main();
