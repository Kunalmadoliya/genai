import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "my-app" });

// Your new function:
const helloWorld = inngest.createFunction(
  { id: "hello-world", triggers: [{ event: "test/hello.world" }] },
 
  async function ({ step }) {
    await step.run("Hello World", async () => {
      console.log("Hello World!");
      return "Hello World!";
    }) , 
    await step.sleep("wait-a-moment", "5s");

    await step.run("Goodbye World", async () => {
      console.log("Goodbye World!");
      const randomNumber = Math.random() > 0.5 ? 1 : 0;
      
      if (randomNumber === 0) {
        throw new Error("Random number was 0, throwing an error!");
      }
      return "Goodbye World!";
    })
  }   
);

// Add the function to the exported array:
export const functions = [
  helloWorld
];