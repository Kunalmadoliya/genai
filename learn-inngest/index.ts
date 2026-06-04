import express from "express";

import { todos, addTodo } from "./store";

const app = express();

app.use(express.json());

app.post("/todos", (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({
      error: "Title is required",
    });
  }

  const todo = addTodo(title);

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