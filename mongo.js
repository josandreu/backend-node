const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger').default;

const Note = require('./models/note');

// if (process.argv.length < 3) {
//   console.log('give password as argument');
//   process.exit(1);
// }

// const password = process.argv[2];

const url = `mongodb+srv://${config.DB_USER}:${config.DB_PASS}@${config.TEST_DB_URL}`;

mongoose.set('strictQuery', false);

logger.info('connecting to', url);

mongoose
  .connect(url)
  .then((result) => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.info('error connecting to MongoDB:', error.message);
  });

const note = new Note({
  content: 'Pay more attention please',
  important: true,
});

note.save().then((result) => {
  console.log('note saved!');
  mongoose.connection.close();
});

// Note.find({}).then((result) => {
//   result.forEach((note) => {
//     console.log(note);
//   });
//   mongoose.connection.close();
// });
