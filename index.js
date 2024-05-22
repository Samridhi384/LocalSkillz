const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
require("dotenv").config();

const userRoutes = require("./routes/user");
const serviceRoutes = require("./routes/service");
const bookingRoutes = require("./routes/booking");
const ratingRoutes = require("./routes/ratings");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

app.use("/", userRoutes);
app.use("/", serviceRoutes);
app.use("/", bookingRoutes);
app.use("/", ratingRoutes);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.set("views", "views");

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("sendNotification", (message) => {
    io.emit("notification", message);
    console.log(message);
  });

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

app.get("/", (req, res) => {
  res.render("auth/main", {
    pageTitle: "LocalSkillz",
  });
});

app.get("/home", (req, res) => {
  res.render("auth/homepage", {
    pageTitle: "LocalSkillz",
  });
});

const port = process.env.PORT || 8081;

server.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}`);
});
