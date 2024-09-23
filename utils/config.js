require('dotenv').config();

const PORT = process.env.PORT;
const DB_PASS = process.env.DB_PASS;
const DB_USER = process.env.DB_USER;
const TEST_DB_URL = process.env.TEST_DB_URL;
const DB_URL =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DB_URL
    : process.env.DB_URL;

module.exports = {
  PORT,
  DB_PASS,
  DB_USER,
  DB_URL,
  TEST_DB_URL,
};
