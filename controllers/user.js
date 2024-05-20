const { Sequelize, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt-config");
const userModel = require("../models").User;

exports.getSignUp = async (req, res) => {
  res.render("auth/signup", {
    pageTitle: "SignUp Page",
    path: "/signup",
    isEdit: false,
  });
};

exports.signUp = async (req, res) => {
  try {
    const user = await userModel.findOne({
      where: {
        email: {
          [Op.eq]: req.body.email,
        },
      },
    });

    if (user) {
      res.status(400).send("User already exists");
    } else {
      let { name, email, password, gridRadios } = req.body;

      let hashedPassword = await bcrypt.hash(password, 10);
      let role;

      if (gridRadios === "user") {
        role = "user";
      } else if (gridRadios === "service_provider") {
        role = "service_provider";
      }

      const newUser = await userModel.create({
        name,
        email,
        password: hashedPassword,
        role,
      });

      const token = jwt.sign(
        {
          id: newUser.id,
        },
        jwtConfig.secret,
        {
          expiresIn: jwtConfig.expiresIn,
        }
      );

      newUser.tokens = newUser.tokens.concat({ token });
      res.cookie("token", token, {
        expires: new Date(Date.now() + 108000000),
        httpOnly: true,
      });

      await newUser.save();

      // res.status(201).send({ newUser, token });

      if (newUser.role === "user") {
        res.status(201).redirect("/userDashboard");
      } else {
        res.status(201).redirect("/serviceDashboard");
      }
    }
  } catch (error) {
    res.status(500).send("error while signup");
    console.log(error);
  }
};

exports.getLogin = async (req, res) => {
  res.render("auth/login", {
    pageTitle: "Login Page",
    path: "/login",
  });
};

exports.login = async (req, res) => {
  try {
    const user = await userModel.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      res.status(400).send("No such user exists");
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(404).send("Password not matched");
    }
    // create a token
    const token = jwt.sign(
      {
        id: user.id,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
      }
    );

    res.cookie("token", token, {
      expires: new Date(Date.now() + 108000000),
      httpOnly: true,
    });

    user.tokens = user.tokens.concat({ token });
    await user.save();

    // res.status(200).send({ message: "Login successfully", token });
    if (user.role === "user") {
      res.status(200).redirect("/userDashboard");
    } else {
      res.status(200).redirect("/serviceDashboard");
    }
  } catch (error) {
    res.status(500).send("error while logging in");
    console.log("ERROR-----------------------------", error);
  }
};

exports.logout = async (req, res) => {
  try {
    // req.user.tokens = req.user.tokens.filter((t) => {
    //   return t.token != req.token;
    // });
    req.user.tokens = [];
    res.clearCookie("token");

    await req.user.save();

    res.status(200).redirect("/");
  } catch (error) {
    res.status(500).send("error while logging out");
    console.log(error);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await userModel.findByPk(req.params.id);
    if (!user) {
      return res.status(400).send("User not found");
    }

    // res.status(200).json({
    //   message: `Welcome ${user.name}`,
    //   data: user,
    // });
    res.status(200).render("customers/profile.ejs", {
      pageTitle: "Profile Page",
      path: "/getProfile",
      user,
    });
  } catch (error) {
    res.send(500).send("error while getting profile");
    console.log(error);
  }
};

exports.getUpdate = async (req, res) => {
  const user = req.user;
  res.render("auth/signup", {
    pageTitle: "Update Profile",
    path: "/update",
    isEdit: true,
    user,
  });
};

exports.update = async (req, res) => {
  try {
    const id = req.user.id;

    const user = await userModel.findByPk(id);
    console.log(id);

    if (!user) {
      res.status(400).send("User not found");
    }

    const updatedUser = await user.update({
      name: req.body.name,
      email: req.body.email,
      role: req.body.role,
    });

    // res.status(200).send(updatedUser);
    res.status(200).redirect(`/getProfile/${id}`);
  } catch (error) {
    res.status(500).send("error while updating");
    console.log(error);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = req.user;

    await user.destroy();
    res.status(200).redirect("/");
  } catch (error) {
    res.status(500).send("error while deleting");
    console.log(error);
  }
};
