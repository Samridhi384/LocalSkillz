const JWT = require("jsonwebtoken");
const jwtConfig = require("./jwt-config");
const { Sequelize, Op } = require("sequelize");
const userModel = require("../models").User;

const validateToken = async (req, res, next) => {
  try {
    // console.log(req.headers);
    // const tokens = req.headers["authorization"];

    const s = req.headers.cookie;
    // console.log(s);
    const token = s.split("token=")[1].split(";")[0].trim();
    // console.log(token);
    const decoded = JWT.verify(token, jwtConfig.secret);
    const user = await userModel.findByPk(
      decoded.id
      //{

      // where: {
      //   id: decoded.id,
      // },
      //}
    );

    if (!user) throw new Error("User not found!");

    req.token = token;
    req.user = user;

    next();
  } catch (error) {
    res.status(404).redirect("/login");
    console.log(error);
  }
};

module.exports = {
  auth: validateToken,
};
