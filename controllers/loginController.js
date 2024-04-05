const People = require("../models/People");
const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const bcrypt = require("bcrypt");

const getLogin = (req, res, next) => {
  res.render("login");
};

const login = async (req, res, next) => {
  try {
    const user = await People.findOne({
      $or: [{ email: req.body.username }, { mobile: req.body.username }],
    });
    if (user) {
      const isValidPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (isValidPassword) {
        const userObject = {
          id: user._id,
          username: user.name,
          email: user.email,
          mobile: user.mobile,
          avatar: user.avatar,
          role: "user",
        };
        const token = jwt.sign(userObject, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRY,
        });

        res.cookie(process.env.JWT_COOKIE_NAME, token, {
          maxAge: process.env.JWT_EXPIRY,
          httpOnly: true,
          signed: true,
        });
        res.locals.loggedInUser = userObject;
        res.redirect("/inbox");
      } else {
        throw createError("Login failed! Please try again.");
      }
    } else {
      throw createError("Login failed! Please try again.");
    }
  } catch (error) {
    res.render("login", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
  }
};
const logout = (req, res) => {
  res.clearCookie(process.env.JWT_COOKIE_NAME);
  res.send("logged out");
};
module.exports = { getLogin, login, logout };
