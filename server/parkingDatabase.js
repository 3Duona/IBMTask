const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("parking.db");

// Create tables if they don't exist and insert pre-made data
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL,
      plate TEXT NOT NULL,
      entry_date DATETIME NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS fees (
      id INTEGER PRIMARY KEY,
      type TEXT NOT NULL,
      weekday_rate REAL NOT NULL,
      friday_rate REAL NOT NULL,
      saturday_rate REAL NOT NULL,
      sunday_rate REAL NOT NULL
    )
  `);

  db.get("SELECT COUNT(*) as count FROM fees", (err, row) => {
    if (err) {
      console.error("Error checking fees table:", err.message);
      return;
    }

    if (row.count === 0) {
      const insertFees = db.prepare(`
        INSERT INTO fees (type, weekday_rate, friday_rate, saturday_rate, sunday_rate) VALUES (?, ?, ?, ?, ?)
      `);

      // Pre-made data for fees table
      const preMadeData = [
        ["Motorcycle", 0.5, 1.5, 2, 0],
        ["Car", 1, 2, 4, 0],
        ["Bus/Truck", 2, 3.5, 5, 0],
      ];

      preMadeData.forEach((data) => {
        insertFees.run(data, (err) => {
          if (err) {
            console.error("Error inserting fees data:", err.message);
          }
        });
      });

      insertFees.finalize((err) => {
        if (err) {
          console.error("Error finalizing fees insert:", err.message);
        }
      });
    }
  });
});

// Close the database connection when the app exits
process.on("exit", () => {
  db.close();
});

module.exports = db;
