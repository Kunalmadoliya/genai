
import client from "./client.js";

const response = await client.responses.create({
  model: "gpt-4.1-mini",
  input: "Write a short story about a robot learning to love.",
});

console.log(response.output_text);
