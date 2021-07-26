const express = require('express');
const cors = require('cors');
const {v4: uuidv4} = require('uuid')


const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers
  const user = users.find(account => account.username == username)
  
  if(!user)
    return response.status(400).json({error: "User not exists"})

    request.user = user;
  
  next()
}

app.post('/users', (request, response) => {
  const {
    name,
    username
  } = request.body
  
  const userExiststs = users.some(account => account.username == username)

  if(userExiststs) 
    response.status(400).json({error: "User already existis"})

  if(!username || !name)
    return response.status(400).send("Insuifcent params")

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user
  return response.status(200).json( user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  // const { username } = request.headers
  const { title, deadline } = request.body 
  const user = request.user
  const todo = {
    // id: uuidv4(),
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo)
  

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const user = request.user
  const {title, deadline} = request.body
  const {id} = request.params

  const taskIndice = user.todos.findIndex(task => task.id == id)

  if(taskIndice == -1)
    return response.status(404).json({error: "Task not found"})
  
  const task = user.todos[taskIndice]

  const updatedTask = {
    ...task,
    title,
    deadline: new Date(deadline)
  }

  user.todos.splice(taskIndice, 1, updatedTask)

  return response.status(200).json(updatedTask)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user
  const taskIndice = user.todos.findIndex(task => task.id == id)

  if(taskIndice == -1)
    return response.status(404).json({error: "Task not found"})
  
  user.todos[taskIndice].done = true

  return response.status(200).json(user.todos[taskIndice])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const user = request.user
  const taskIndice = user.todos.findIndex(task => task.id == id)

  if(taskIndice == -1)
    return response.status(404).json({error: "Task not found"})
  
  user.todos.splice(taskIndice, 1)

  return response.status(204).json(user.todos)
});

module.exports = app;