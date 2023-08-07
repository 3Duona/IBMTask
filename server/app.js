const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Use the cors middleware
app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const dbz = require("./parkingDatabase");
const db = new sqlite3.Database("parking.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Route to fetch parking fees
app.get("/fees", (req, res) => {
  db.all("SELECT * FROM fees", (err, rows) => {
    if (err) {
      console.error("Error fetching parking fees:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(200).json(rows);
  });
});

// Route to update parking fees
app.put("/fees", (req, res) => {
  const updatedFees = req.body;

  if (!Array.isArray(updatedFees)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  db.serialize(() => {
    updatedFees.forEach((fee) => {
      db.run(
        "UPDATE fees SET weekday_rate = ?, friday_rate = ?, saturday_rate = ?, sunday_rate = ? WHERE type = ?",
        [
          fee.weekday_rate,
          fee.friday_rate,
          fee.saturday_rate,
          fee.sunday_rate,
          fee.type,
        ],
        (err) => {
          if (err) {
            console.error("Error updating parking fee:", err.message);
            return res.status(500).json({ error: "Internal server error" });
          }
        }
      );
    });
    return res
      .status(200)
      .json({ message: "Parking fees updated successfully" });
  });
});

// Route to get all parking fees
app.get("/fees", (req, res) => {
  db.all("SELECT * FROM fees", (err, fees) => {
    if (err) {
      console.error("Error in retrieving parking fees:", err.message);
      return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(200).json(fees);
  });
});

// Route to update parking fees
app.post("/fees", (req, res) => {
  const { type, weekday_rate, friday_rate, saturday_rate, sunday_rate } =
    req.body;

  db.run(
    "UPDATE fees SET weekday_rate = ?, friday_rate = ?, saturday_rate = ?, sunday_rate = ? WHERE type = ?",
    [weekday_rate, friday_rate, saturday_rate, sunday_rate, type],
    (err) => {
      if (err) {
        console.error("Error in updating parking fees:", err.message);
        return res.status(500).json({ error: "Internal server error" });
      }

      return res
        .status(200)
        .json({ message: "Parking fees updated successfully" });
    }
  );
});

// Route handler for parking lot entry and exit
app.post("/upload", async (req, res) => {
  try {
    const plateNumber = req.body.plate;
    const type = req.body.type;
    const entryTimestamp = req.body.entryTime;
    const parkingFee = 0;
    let vehicleType;

    if (
      type === "Sedan" ||
      type === "SUV" ||
      type === "Pickup" ||
      type === "Van"
    ) {
      vehicleType = "Car";
    } else if (type === "Truck" || type === "Bus" || type === "Trailer") {
      vehicleType = "Truck";
    } else if (type === "Motorcycle" || type === "Bicycle") {
      vehicleType = "Motorcycle";
    } else {
      return res.status(500).json({ error: "Car type unrecognized error" });
    }

    if (!plateNumber) {
      return res.status(400).json({ error: "Plate number recognition failed" });
    }

    // Check if the vehicle is already in the database
    db.get(
      "SELECT * FROM vehicles WHERE plate = ? AND entry_date IS NOT NULL",
      [plateNumber],
      (err, vehicle) => {
        if (err) {
          console.error("Error retrieving vehicle data:", err.message);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (vehicle) {
          console.log("vehicle found", vehicle);
          db.get(
            "SELECT * FROM fees WHERE type = ?",
            [vehicleType],
            (err, row) => {
              console.log("fees found", row);
              let entryTimestamp = vehicle.entry_date;
              let exitTimestamp = req.body.entryTime;

              console.log(entryTimestamp, exitTimestamp);

              const ratesArray = [
                row.weekday_rate,
                row.weekday_rate,
                row.weekday_rate,
                row.weekday_rate,
                row.friday_rate,
                row.saturday_rate,
                row.sunday_rate,
              ];

              const parkingFee = calculateParkingCost(
                entryTimestamp,
                exitTimestamp,
                ratesArray
              );

              console.log(parkingFee);

              // Delete the vehicle from the database after displaying the invoice
              db.run(
                "DELETE FROM vehicles WHERE plate = ?",
                [plateNumber],
                (err) => {
                  if (err) {
                    console.error("Error deleting vehicle data:", err.message);
                    return res
                      .status(500)
                      .json({ error: "Internal server error" });
                  }

                  return res.status(200).json({
                    plateNumber,
                    parkingFee,
                    message: "Exit recorded successfully",
                  });
                }
              );
            }
          );
        } else {
          // Vehicle not found in the database, add a new entry
          db.run(
            "INSERT INTO vehicles (type, plate, entry_date) VALUES (?, ?, ?)",
            [vehicleType, plateNumber, entryTimestamp],
            (err) => {
              if (err) {
                console.error("Error inserting vehicle data:", err.message);
                return res.status(500).json({ error: "Internal server error" });
              }

              return res
                .status(200)
                .json({ plateNumber, message: "Entry recorded successfully" });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error in /upload:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

function calculateParkingCost(entryTimestamp, exitTimestamp, hourlyCosts) {
  const millisecondsPerHour = 1000 * 60 * 60;

  const entryDate = new Date(entryTimestamp);
  const exitDate = new Date(exitTimestamp);

  const timeDiffMilliseconds = exitDate - entryDate;
  const timeDiffHours = timeDiffMilliseconds / millisecondsPerHour;

  let totalCost = 0;
  let currentDate = new Date(entryDate);

  while (currentDate < exitDate) {
    const dayOfWeek = (currentDate.getUTCDay() + 6) % 7;

    totalCost += (hourlyCosts[dayOfWeek] || 0) * Math.min(1, timeDiffHours);

    currentDate.setTime(currentDate.getTime() + millisecondsPerHour);
  }

  return totalCost.toFixed(2);
}
