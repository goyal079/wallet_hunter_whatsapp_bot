require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./app/routes");
const { sequelize } = require("./config/database");

const app = express();

// Enable CORS
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.DB_NAME, process.env.DB_HOST, process.env.DB_PORT, process.env.DB_URL);
// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8000;

sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("Unable to sync database:", err);
    process.exit(1);
  });

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});
