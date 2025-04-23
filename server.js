const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host:"SeansComp",
  user: "root",
  password: "Y8#vTq9!M4z@XpL2",
  database: "StickyNoteDatabase"
});

// Add Event (with duplicate check)
app.post('/events', (req, res) => {
  const { title, description, date, time, group_name, recurrence, force } = req.body;

  // Check if the event already exists (same title, date, and time)
  const checkDuplicateSql = 'SELECT * FROM events WHERE title = ? AND date = ? AND time = ?';
  
  db.query(checkDuplicateSql, [title, date, time], (err, results) => {
    if (err) return res.status(500).send(err);

    if (results.length > 0 && !force) {
      // If duplicates found and force is not set, send a message about duplication
      // Event already exists, send a message about duplication
      return res.status(400).json({ message: "Duplicate event found. Are you sure you want to add this?" });
    }

    // If no duplicates, proceed to add the new event
    const insertSql = `INSERT INTO events (title, description, date, time, group_name, recurrence)
                       VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(insertSql, [title, description, date, time, group_name, recurrence], (err, result) => {
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
  const {highlight_class} = req.body;
  const query = 'UPDATE events SET highlight_class = ?, is_highlighted = TRUE WHERE id = ?';
  db.query(query, [highlight_class, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Event highlight color updated');
  });
});

// Search Events
app.get('/events/search/:query', (req, res) => {
  const query = `%${req.params.query}%`;
  db.query('SELECT * FROM events WHERE title LIKE ? OR description LIKE ?', [query, query], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Get All Events (optional group filter)
app.get('/events', (req, res) => {
  const group = req.query.group;
  const sql = group ? 'SELECT * FROM events WHERE group_name = ?' : 'SELECT * FROM events';
  const params = group ? [group] : [];
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => console.log('Server running on port 3000'));
