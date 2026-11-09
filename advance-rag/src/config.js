import "dotenv/config";

export const config = {
  port: process.env.PORT || 8000,
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
  qdrant: {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collection: process.env.QDRANT_COLLECTION || "my_collection",
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
    embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
    embeddingDimension: parseInt(process.env.OPENAI_EMBEDDING_DIMENSION) || 1536,
    chatModel: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  },
  chunking: {
    chunkSize: parseInt(process.env.CHUNK_SIZE) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 200,
  },
  retrieval: {
    topK: parseInt(process.env.TOP_K) || 5,
    rrfk : parseInt(process.env.RRF_K) || 10,
    finalK: parseInt(process.env.FINAL_K) || 5,

  },
};

export const INDEXING_QUEUE = "file-indexing-queue";
export const Querty_QUEUE = "query-queue";
