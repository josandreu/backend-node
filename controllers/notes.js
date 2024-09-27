const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { error } = require('../utils/logger');

const getTokenFrom = (request) => {
  const authorization = request.get('authorization');

  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '');
  }

  return null;
};

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 });

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

  const decodeToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

  if (!decodeToken.id) {
    return response.status(401).json({
      error: 'token invalid',
    });
  }

  const user = await User.findById(decodeToken.id);

  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false,
    user: user.id,
  });

  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

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
