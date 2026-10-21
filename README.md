# StickyNote App

A full-stack sticky notes and event planner. Create an account, add notes with a date, time, group, and recurrence, edit them in place, color-code them, and pick a background image that is saved to your account.

## Features

- User registration and login (passwords hashed with bcrypt)
- Create, edit, and delete notes
- Highlight notes in different colors
- Group notes (Work, Personal, Errand, Other) and set a recurrence
- Choose a background image that is remembered between sessions

## Tech Stack

- Node.js and Express
- MySQL 8
- Vanilla HTML, CSS, and JavaScript
- Docker and Docker Compose

## Getting Started

You only need [Docker](https://docs.docker.com/get-docker/) installed.

1. Clone the repo:

   ```bash
   git clone https://github.com/SeanMichals/StickyNotesApp.git
   cd StickyNotesApp
   ```

2. Create your environment file and set your own passwords:

   ```bash
   cp .env.example .env
   ```

   Open `.env` and replace the placeholder values. Keep quotes around any password that contains a `#`.

3. Start the app:

   ```bash
   docker compose up --build
   ```

4. Open http://localhost:3000/login.html, register an account, and start adding notes.

To stop the app, press Ctrl+C and run `docker compose down`. Add `-v` to also delete the database.

If you change any database passwords after the first run, run `docker compose down -v` first. MySQL only reads them when it creates a new database.

## Project Structure

```
public/              Front end (login.html, index.html, app.js)
server.js            Express server and API routes
db/schema.sql           Database tables, loaded automatically on first start
Dockerfile           Builds the Node app image
docker-compose.yml   Runs the app and MySQL together
.env.example         Template for configuration
```

## API

| Method | Route | Purpose |
| --- | --- | --- |
| POST | /register | Create an account |
| POST | /login | Log in |
| GET | /events?userId= | List a user's notes |
| POST | /events | Add a note |
| PUT | /events/:id | Edit a note's title and description |
| PATCH | /events/:id/highlight | Change a note's color |
| DELETE | /events/:id | Delete a note |
| GET, POST | /users/:id/background | Get or save a background image |

## Known Limitations

- Login stores the user ID in the browser instead of using sessions or tokens.
- No minimum password length is enforced.

## Future Improvements

- Session-based authentication
- Ownership checks on note routes
- Live deployment
