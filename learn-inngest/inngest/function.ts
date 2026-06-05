import {inngest} from "./client";
import {auditLog} from "../store";

export const onTodoCreated = inngest.createFunction(
  {
    id: "on-todo-created",
    triggers: [{event: "todo/created"}],
  },
  async ({event, step}) => {
    await step.run("audit", async () => {
      auditLog.push({
        action: "created",
        id: event.data.todo.id,
        title: event.data.todo.title,
        timestamp: new Date().toISOString(),
      });

      return {ok: true};
    });
  },
);

export const onTodoDelete = inngest.createFunction(
  {
    id: "on-todo-deleted",
    triggers: [{event: "todo/deleted"}],
  },
  async ({event, step, attempt}) => {
    const id = event.data.todo.id;
    await step.run("wait-to-delete", async () => {
      if (attempt === 0) {
        throw new Error(`Failed to deleted with id ${id}`);
      }

      return "cleaned up successfully";
    });
  },
);
