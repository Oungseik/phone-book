const fs = require("fs");
const express = require("express");
const utils = require("./lib/utils");
const morgan = require("morgan");
const cors = require('cors');
const { request } = require("http");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("build"));

morgan.token("body", (req, _res) => {
  return JSON.stringify(req.body);
})

app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"))

let persons = fs.readFileSync("data/persons.json");
persons = JSON.parse(persons);

app.get("/api/persons", (_req, res) => {
  res.json(persons);
})

// get info
app.get("/info", (_req, res) => {
  const len = persons.length;
  const date = new Date().toUTCString();
  res.send(`
<p>Phonebook has info for ${len} people</p>
</p>${date}</p>
`)
});

// fetching a single resource
app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);

  if (!person) {
    res.status(404).end();
  }

  res.json(person);
});

app.put("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const updatedPerson = req.body;

  if (!updatedPerson.name | !updatedPerson.number) {
    return res.status(422).json({
      error: "update value of content missing"
    })
  }

  persons = persons.map(person => person.id === id ? updatedPerson : person);
  const content = {
    ...persons.find(person => person.id === updatedPerson.id),
    ...updatedPerson
  }

  res.json(content);
})

// deleting resource
app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

// receiving data (post the data)
app.post("/api/persons", (req, res) => {
  const newPerson = req.body;

  if (!newPerson.name || !newPerson.number) {
    return res.status(400).json({
      error: "content missing",
    })
  }

  if (utils.includes(persons, newPerson)) {
    return res.status(400).json({
      error: "name must be unique"
    })
  }

  const contact = {
    id: utils.generateId(persons),
    name: newPerson.name,
    number: newPerson.number
  }

  persons.push(contact);
  res.json(contact);
})

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("server is running on port", PORT);
})
