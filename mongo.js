const mongoose = require('mongoose');

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@fullstack-db.viyas.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Fullstack-db`;

mongoose.set('strictQuery', false);

mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

const Note = mongoose.model('Note', noteSchema);

// const note = new Note({
//   content: 'Tus padres no son mis padres',
//   important: true,
// });

// note.save().then((result) => {
//   console.log('note saved!');
//   console.log(result);
//   mongoose.connection.close();
// });

Note.find({ important: true }).then((result) => {
  result.forEach((note) => {
    console.log('note', note);
  });
  mongoose.connection.close();
});
