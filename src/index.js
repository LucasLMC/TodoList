const { response, request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.get("/", (request, response) => {
  return response.send("server up");
});

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name: name,
    username: username,
    todos: [],
  });

  const newUser = users.find((user) => user.username === username);

  return response.status(201).send(newUser);
});

app.get("/users", (request, response) => {
  return response.send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  console.log(user);
  return response.status(200).send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { username } = request.headers;

  const todoadicioned = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  const user = users.find((user) => user.username === username);

  user.todos.push(todoadicioned);

  return response.status(201).send(todoadicioned);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.status(201).send(user.todos);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id == id);

  if (!todo) {
    return response.status(400).json({ error: "Todo not found" });
  }

  user.todos = user.todos.filter((todo) => todo.id !== id);

  return response.status(200).json(user.todos);
});

module.exports = app;
