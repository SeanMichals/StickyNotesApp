const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "SeansComp",
  user: "root",
  password: "Y8#vTq9!M4z@XpL2",
  database: "StickyNoteDatabase"
});

const bcrypt = require('bcrypt');

// Register User
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], (err, result) => {
    if (err) return res.status(400).json({ error: 'Username already exists' });
    res.json({ message: 'User registered' });
  });
});

// Login User
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.json({ message: 'Login successful', userId: user.id });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Add Event (with duplicate check)
app.post('/events', (req, res) => {
  const { title, description, date, time, group_name, recurrence, force, userId } = req.body;

  if (!userId) return res.status(400).json({ error: 'Missing user ID' });

  const checkDuplicateSql = 'SELECT * FROM events WHERE title = ? AND date = ? AND time = ? AND user_id = ?';

  db.query(checkDuplicateSql, [title, date, time, userId], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0 && !force) {
      return res.status(400).json({ message: "Duplicate event found. Are you sure you want to add this?" });
    }

    const insertSql = `
      INSERT INTO events (title, description, date, time, group_name, recurrence, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(insertSql, [title, description, date, time, group_name, recurrence, userId], (err, result) => {
      if (err) return res.status(500).send(err);
      res.send('Event added');
    });
  });
});

// Delete Event
app.delete('/events/:id', (req, res) => {
  db.query('DELETE FROM events WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Event deleted');
  });
});

// Highlight Event
app.patch('/events/:id/highlight', (req, res) => {
  const { highlight_class } = req.body;

  // Ensure highlight_class is provided
  if (!highlight_class) return res.status(400).json({ error: 'Missing highlight class' });

  const query = 'UPDATE events SET highlight_class = ?, is_highlighted = TRUE WHERE id = ?';
  db.query(query, [highlight_class, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Event highlight color updated');
  });
});

// Get Events for a User (with optional group filter)
app.get('/events', (req, res) => {
  const { group, userId } = req.query;

  if (!userId) return res.status(400).json({ error: 'Missing user ID' });

  let sql = 'SELECT * FROM events WHERE user_id = ?';
  const params = [userId];

  if (group) {
    sql += ' AND group_name = ?';
    params.push(group);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.put('/events/:id', (req, res) => {
  const { title, description } = req.body;

  const sql = 'UPDATE events SET title = ?, description = ? WHERE id = ?';
  db.query(sql, [title, description, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Event updated');
  });
});


app.listen(3000, () => console.log('Server running on port 3000'));
