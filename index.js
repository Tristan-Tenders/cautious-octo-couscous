require('dotenv').config({ path: `.env.${process.env.NODE_ENV || 'development'}` });
const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.urlencoded({ extended: true }));

const db = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

db.query('CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, name TEXT, email TEXT)');

app.get('/', async (req, res) => {
  const { rows } = await db.query('SELECT * FROM users');
  res.send(`
    <h1>Users</h1>
    <form method="POST" action="/users">
      <input name="name" placeholder="Name" />
      <input name="email" placeholder="Email" />
      <button>Add</button>
    </form>
    <ul>
      ${rows.map(u => `<li>${u.name} - ${u.email}</li>`).join('')}
    </ul>
  `);
});

app.post('/users', async (req, res) => {
  await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', [req.body.name, req.body.email]);
  res.send('<h1>User created!</h1><a href="/">Go back</a>');
});

app.listen(3000, () => console.log('http://localhost:3000'));