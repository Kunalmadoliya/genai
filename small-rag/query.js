
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HydeRetriever } from "@langchain/classic/retrievers/hyde";

async function queryVectorStore(query) {
  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings,
    {
      url: "http://localhost:6333",
      collectionName: "my_collection",
    }
  );

  const hydeRetriever = new HydeRetriever({
    vectorStore,
    llm: new ChatOpenAI({
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY,
    }),
    k: 3,
  });

  // Retrieve documents
  const docs = await hydeRetriever.invoke(query);

  const context = docs
    .map((doc) => doc.pageContent)
    .join("\n\n");

  // Streaming LLM
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const stream = await llm.stream([
    {
      role: "system",
      content: "Answer using only the provided context in less than 100 words.",
    },
    {
      role: "user",
      content: `Context:\n${context}\n\nQuestion: ${query}`,
    },
  ]);

  // Print tokens as they arrive
  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
  }

  console.log("\n");
}

queryVectorStore("What is the main topic of the PDF?");
