const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({});
  response.json(notes);
});

notesRouter.get('/:id', async (request, response, next) => {
  const note = await Note.findById(request.params.id);

  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

notesRouter.post('/', async (request, response, next) => {
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

  const savedNote = await note.save();
  response.status(201).json(savedNote);
});

notesRouter.delete('/:id', async (request, response, next) => {
  await Note.findByIdAndDelete(request.params.id);
  response.status(204).end();
});

notesRouter.put('/:id', (request, response, next) => {
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

module.exports = notesRouter;
