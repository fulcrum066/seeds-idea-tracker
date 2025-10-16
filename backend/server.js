const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // Load env immediately

const express = require("express");
const colors = require("colors");
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");

// Port from .env or default to 5000
const port = process.env.PORT || 5000;

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/seeds", require("./routes/seedRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/board", require("./routes/boardRoutes"));
app.use("/api", require("./routes/searchRoutes"));


// Serve frontend in production
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

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
