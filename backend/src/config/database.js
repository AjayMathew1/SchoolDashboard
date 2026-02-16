const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');

// Create database connection
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database with schema
function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema);
  console.log('Database initialized successfully');
}

// Helper function to generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

module.exports = {
  db,
  initializeDatabase,
  generateUUID
};
