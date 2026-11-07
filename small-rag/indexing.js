import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

async function createVectorStoreFromPDF(pdfPath) {
  const loader = new PDFLoader(pdfPath);
  console.log('Loading documents from PDF:', loader);
  const docs = await loader.load();

  console.log('Documents loaded:', docs.length);

  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
    apiKey: process.env.OPENAI_API_KEY
  });
  const vectorStore = new QdrantVectorStore(embeddings, {
    url: 'http://localhost:6333',
    collectionName: 'my_collection'
  });

  await vectorStore.addDocuments(docs);
}

createVectorStoreFromPDF("./attention.pdf")