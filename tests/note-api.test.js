const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test-helper');
const Note = require('../models/note');

const initialNotes = helper.initialNotes;

const api = supertest(app);

beforeEach(async () => {
  await Note.deleteMany({});
  console.log('cleared');

  /*
    initialNotes.forEach(async (note) => {
    let noteObject = new Note(note);
    await noteObject.save();
    console.log('saved');
    });

    cleared
    done
    entered test
    saved
    saved

    El problema es que cada iteración del bucle forEach genera su propia operación asíncrona, y beforeEach no esperará a que terminen de ejecutarse. En otras palabras, los comandos await definidos dentro del bucle forEach no están en la función beforeEach, sino en funciones separadas que beforeEach no esperará.

    Dado que la ejecución de las pruebas comienza inmediatamente después de que beforeEach haya terminado de ejecutarse, la ejecución de las pruebas comienza antes de que se inicialice el estado de la base de datos.

    Opción 1:
    beforeEach(async () => {
      await Note.deleteMany({})

      const noteObjects = helper.initialNotes
        .map(note => new Note(note))
      const promiseArray = noteObjects.map(note => note.save())
      await Promise.all(promiseArray)
    })

    Opción 2:
    for (let note of initialNotes) {
      const noteObject = new Note(note);
      await noteObject.save();
      console.log('saved');
    }
  */

  await Note.deleteMany({});

  await Note.insertMany(initialNotes);

  console.log('done');
});

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/);
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

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();
  const contents = notesAtEnd.map((r) => r.content);

  assert.strictEqual(notesAtEnd.length, initialNotes.length + 1);

  assert(contents.includes('async/await simplifies making async calls'));
});

test('note without content is not added', async () => {
  const newNote = {
    important: true,
  };

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)
    .expect('Content-Type', /application\/json/);

  const notesAtEnd = await helper.notesInDb();

  assert.strictEqual(notesAtEnd.length, initialNotes.length);
});

test('a specific note can be viewed', async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test('a note can be deleted', async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await helper.notesInDb();

  const contents = notesAtEnd.map((r) => r.response);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

after(async () => {
  await mongoose.connection.close();
});
