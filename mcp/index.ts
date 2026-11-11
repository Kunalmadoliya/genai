import {McpServer} from "@modelcontextprotocol/server";
import {StdioServerTransport} from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

const server = new McpServer({name: "kunal-server", version: "1.0.0"});

server.registerTool(
  "Add Numbers",
  {
    description: "Add two numbers",
    inputSchema: z.object({a: z.number(), b: z.number()}),
  },
  async (ctx) => {
    return {
      content: `The sum of ${ctx.a} and ${ctx.b} is ${ctx.a + ctx.b}`,
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
