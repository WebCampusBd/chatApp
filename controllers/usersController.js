const bcrypt = require("bcrypt");
const People = require("../models/People");
const path = require("path");
const { unlink } = require("fs");

const getUsers = async (req, res, next) => {
  if (req.user.id == "661003222f922eabafa11690") {
    try {
      const users = await People.find();
      res.render("users", { users });
    } catch (error) {
      next(error.message);
    }
  } else {
    res.redirect("/inbox");
  }
};

const addUser = async (req, res, next) => {
  let newUser;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (req.files && req.files.length > 0) {
    newUser = new People({
      ...req.body,
      avatar: req.files[0].filename,
      password: hashedPassword,
    });
  } else {
    newUser = new People({
      ...req.body,
      password: hashedPassword,
    });
  }

  try {
    await newUser.save();
    res.status(201).json({
      message: "User was added successfully!",
    });
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occured!",
        },
      },
    });
  }
};

const removeUser = async (req, res, next) => {
  try {
    const user = await People.findByIdAndDelete({ _id: req.params.id });

    // remove files
    if (user.avatar) {
      unlink(
        path.join(__dirname + `/../public/uploads/avatars/${user.avatar}`),
        (err) => {
          if (err) console.log(err);
        }
      );
    }

    res.status(200).json({
      message: "User was removed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Could not delete the user!",
        },
      },
    });
  }
};

module.exports = { getUsers, addUser, removeUser };
