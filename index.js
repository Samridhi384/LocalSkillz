const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const userRoutes = require("./routes/user");
const serviceRoutes = require("./routes/service");
const bookingRoutes = require("./routes/booking");
const ratingRoutes = require("./routes/ratings");

const app = express();

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

app.listen(port, () => {
  console.log(`Server listening on: http://localhost:${port}`);
});
