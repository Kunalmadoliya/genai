export const auditLog = [] as any

let nextId = 1;

export type todoData = {
  id: number;
  title: string;
  completed: boolean;
};

export const todos = [] as todoData[];

export function addTodo(title: string) {
  const todo: todoData = {id: nextId++, title, completed: false};

  todos.push(todo);
  return todo;
}

export function getTodo(id: Number) {
  const findIndex = todos.find((todo) => todo.id === id);

  return findIndex;
}

export function updateTodo(id: Number, patch: Partial<todoData>) {
  const findTodo = getTodo(id);

  if (!findTodo) return;

  if (typeof patch.title !== "undefined") {
    findTodo.title = patch.title;
  }

  if (typeof patch.completed !== "undefined") {
    findTodo.completed = patch.completed;
  }

  return findTodo;
}

export function deleteTodo(id: Number) {
  const findTodo = todos.findIndex((todo) => todo.id === id);

  if (findTodo === -1) return;

  return todos.splice(findTodo, 1)[0];
}
