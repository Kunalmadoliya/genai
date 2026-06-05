import "dotenv/config";
import express from "express";

import {todos, addTodo, deleteTodo, updateTodo, getTodo} from "./store";
import {serve} from "inngest/express";
import {inngest} from "./inngest/client";
import {onTodoCreated, onTodoDelete, onTodoUpdate} from "./inngest/function";

const app = express();

app.use(express.json());
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [onTodoCreated, onTodoDelete, onTodoUpdate],
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

  return res.status(201).json({
    message: "Todo created successfully",
    todo,
  });
});

app.get("/:id", (req, res) => {
  const userId = Number(req.params.id);

  const findTodo = getTodo(userId);
  if (!findTodo) {
    return res.status(404).json({
      error: "Todo not found",
    });
  }

  return res.json(findTodo);
});

app.delete("/todos/:id", async (req, res) => {
  const userId = Number(req.params.id);

  if (!userId || isNaN(userId)) {
    return res.status(404).json({
      error: "Invalid ID",
    });
  }

  const deleted = deleteTodo(userId);

  await inngest.send({
    name: "todo/deleted",
    data: {todos},
  });

  if (!deleted) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  return res.status(200).json({
    message: "User deleted successfully",
  });
});

app.patch("/todos/:id", async (req, res) => {
  const userId = Number(req.params.id);

  const {title, completed} = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({
      error: "Invalid User Id",
    });
  }

  if (typeof title === "undefined" && typeof completed === "undefined") {
    return res.status(400).json({
      error: "Nothing to update",
    });
  }

  const upTodo = updateTodo(userId, {
    title,
    completed,
  });

  console.log(upTodo, userId, title, completed);

  if (!upTodo) {
    return res.status(404).json({
      error: "Todo not found",
    });
  }

  await inngest.send({
    name: "todo/update",
    data: {todos},
  });

  return res.status(200).json({
    message: "User updated successfully!",
    upTodo,
  });
});

app.get("/", (req, res) => {
  return res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
