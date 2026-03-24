const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

let dbInstance;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'kaziconnect.db'),
      driver: sqlite3.Database
    });
    
    // Enable foreign keys
    await dbInstance.exec('PRAGMA foreign_keys = ON');
    
    // Initialize schema if not exists
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await dbInstance.exec(schema);
  }
  return dbInstance;
}

module.exports = {
  // Wrapper to simulate pg's query interface
  query: async (text, params = []) => {
    const db = await getDb();
    
    // Convert $1, $2 to ? for sqlite
    const sqliteText = text.replace(/\$\d+/g, '?');
    
    const uppercaseText = sqliteText.trim().toUpperCase();
    if (uppercaseText.startsWith('SELECT') || uppercaseText.includes('RETURNING')) {
      const rows = await db.all(sqliteText, ...params);
      return { rows };
    } else {
      const result = await db.run(sqliteText, ...params);
      return { rows: [{ id: result.lastID }] }; 
    }
  }
};
