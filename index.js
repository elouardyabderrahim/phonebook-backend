const express = require("express");
app = express();
const morgan = require("morgan");
const cors = require("cors");

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

// built-in middeleware function in express. json-parser
app.use(express.json());
app.use(requestLogger);
app.use(cors());
/*
Middleware are functions that can be used for handling
 request and response objects.
 The json-parser we used earlier takes the raw data from
  the requests that are stored in the request object, parses
   it into a JavaScript object and assigns it to the request 
   object as a new property body.

*/
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
  )
);
// or morgan('tiny')
// npm install --save-dev nodemon
// node_modules/.bin/nodemon index.js
//  after adding dev i scripts in package.json npm run dev

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];
// create a custom Morgan token for logging request body
morgan.token("req-body", (req, res) => {
  return JSON.stringify(req.body);
});

// changing the port for deployment
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`<p>PhoneBook has info for ${persons.length} people</p>
    <p>${Date()}<p>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.statusMessage = `no person with id ${id} is found`;
    response.status(400).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    persons.filter((person) => person.id !== id);
    response.statusMessage = `person with ${JSON.stringify(
      person
    )} deleted successfully`;
    response.status(204).end();
  } else {
    response.statusMessage = `no person with id ${id} is found to be deleted`;
    response.status(400).end();
  }
});

app.post("/api/persons", (request, response) => {
  const body = request.body;
  function generatedId() {
    return Math.ceil(Math.random() * 200000000000);
  }
  console.log(JSON.stringify(body.number), JSON.stringify(body.name));
  if (!body.name) {
    return response.status(400).json({
      error: "name is missing",
    });
  } else if (!body.number) {
    return response.status(400).json({
      error: "number is missing",
    });
  } else if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  const person = {
    id: generatedId(),
    name: body.name,
    number: body.number,
  };
  persons.concat(person);
  response.json(person);
});
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};
app.use(unknownEndpoint);
