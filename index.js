require('dotenv').config();

const express = require('express');
const cors = require('cors');
//const mongoose = require('mongoose');

const Note = require('./models/note');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;

  return maxId + 1;
};

app.get('/api/notes', (request, response) => {
  Note.find({}).then((notes) => {
    response.json(notes);
  });
});

app.get('/api/notes/:id', (request, response) => {
  Note.findById(request.params.id).then((note) => {
    response.json(note);
  });
});

app.delete('/api/notes/:_id', (request, response) => {
  Note.deleteOne(request.params).then((result) => {
    response.json(result);
  });
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

  Note.findByIdAndUpdate(request.params.id, note, opts).then((note) => {
    response.json(note);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
