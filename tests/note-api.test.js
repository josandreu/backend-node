const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Note = require('../models/note');

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false,
  },
  {
    content: 'Browser can execute only JavaScript, yeah',
    important: true,
  },
];

const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});
  let noteObject = new Note(initialNotes[0]);
  await noteObject.save();

  noteObject = new Note(initialNotes[1]);
  await noteObject.save();
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

after(async () => {
  await mongoose.connection.close();
});

test('there are two notes', async () => {
  const response = await api.get('/api/notes');

  // la ejecución llega aquí solo después de que se completa la solicitud HTTP
  // el resultado de la solicitud HTTP se guarda en la variable response
  assert.strictEqual(response.body.length, initialNotes.length);
});

test('the first note is about HTTP methods', async () => {
  const response = await api.get('/api/notes');

  const contents = response.body.map((e) => e.content);
  assert(contents.includes('HTML is easy'));
});
