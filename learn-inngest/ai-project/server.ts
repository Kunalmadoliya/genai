import "dotenv/config";
import express from "express";
import {inngest} from "./inngest-client";
import {serve} from "inngest/express";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [],
  }),
);

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
