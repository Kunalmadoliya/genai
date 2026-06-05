import "dotenv/config";
import express from "express";

import {todos, addTodo} from "./store";
import {serve} from "inngest/express";
import {inngest} from "./inngest/client";
import {onTodoCreated} from "./inngest/function";

const app = express();

app.use(express.json());
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onTodoCreated],
  }),
);

app.post("/todos", async (req, res) => {
  const {title} = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  const todo = addTodo(title);

  await inngest.send({
    name: "todo/created",
    data: {todo},
  });

  console.log(title);
  

  return res.status(201).json({
    message: "Todo created successfully",
    todo,
  });
});

app.get("/todos", (req, res) => {
  return res.json(todos);
});

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
