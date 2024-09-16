const express = require('express');
const app = express();
require('dotenv').config();
//const mongoose = require('mongoose');

const Note = require('./models/note');

app.use(express.static('dist'));

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

// Error middleware
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }

  next(error);
};

const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(requestLogger);

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;

  return maxId + 1;
};

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      // console.log('error', error);
      // response.status(400).send({ error: 'malformatted id' });
      next(error); // middleware
    });
});

app.delete('/api/notes/:id', (request, response) => {
  Note.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post('/api/notes', (request, response) => {
  const body = request.body;

  if (!body.content || body.content === undefined) {
    return response.status(400).json({
      error: 'Content is missing',
    });
  }

  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
  });

  note.save().then((savedNote) => {
    response.json(savedNote);
  });
});

app.put('/api/notes/:id', (request, response) => {
  const note = {
    content: request.body.content,
    important: request.body.important,
  };

  const opts = {
    runValidators: true,
    new: true,
    context: 'query',
  };

  Note.findByIdAndUpdate(request.params.id, note, opts)
    .then((updatedNote) => {
      response.json(updatedNote);
    })
    .catch((error) => next(error));
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
