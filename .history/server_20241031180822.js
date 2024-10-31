// Import necessary modules
require("./config/db");
const express = require("express");  // Import express
const path = require("path");        // Import path for directory handling

const app = express();
const port = process.env.PORT || 5000;
const UserRouter = require("./api/User"); // importing user routes

// for accepting JSON POST requests
app.use(express.json());

// Route setup
app.use("/user", UserRouter);

// Serve static files from the 'views' directory
app.use(express.static(path.join(__dirname, "views")));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
