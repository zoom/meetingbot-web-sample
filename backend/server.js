const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware.js");

dotenv.config();
const port = process.env.PORT || 30015;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Error handling middleware
app.use(errorHandler);

const fs = require("fs");
const { getZoomAPIAccessToken } = require("./api/zoomAPI.js");

const zoomRoutes = require("./routes/zoomRoutes"); // Import the zoomRoutes.js file

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

console.log(__dirname);

app.get("/websocket", async (req, res) => {
  try {
    const acc = await getZoomAPIAccessToken();

    // Read the HTML file
    fs.readFile("backend/public/index.html", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
        return;
      }

      // Replace the access token in the HTML code
      data = data.replace("${access_token}", acc);

      // Send the HTML code as the response
      res.send(data);
    });
  } catch (error) {
    console.error("Error handling request: ", error.message);
    res.status(500).send("Internal Server Error");
  }
});

app.use("/api/zoom", zoomRoutes); // Use the zoomRoutes.js file for all routes starting with /api/zoom

// app.use(notFound);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
