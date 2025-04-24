-- Users table (with background_image stored as TEXT instead of referencing image_background)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  background_image TEXT  -- optional background image URL
);

-- Background table (optional multiple images per user)
CREATE TABLE image_background (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  image_url TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  is_highlighted BOOLEAN DEFAULT FALSE,
  group_name VARCHAR(100),
  recurrence ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  highlight_class VARCHAR(50),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
