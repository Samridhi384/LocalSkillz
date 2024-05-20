require("dotenv").config();

module.exports = {
  secret: process.env.SECRET,
  expiresIn: "1h",
};
