const express = require("express");
const colors = require("colors");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const port = process.env.PORT || 5000;

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/seeds", require("./routes/seedRoutes"));

// Serve frontend
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(
      path.resolve(__dirname, "../", "frontend", "build", "index.html")
    )
  );
}

// Error handler
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
