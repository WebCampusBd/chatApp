// external imports
const express = require("express");
const router = express.Router();

// internal imports
const {
  getUsers,
  addUser,
  removeUser,
} = require("../controllers/usersController");
const decoreateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");
const {
  addUserValidators,
  addUserValidationHandler,
} = require("../middlewares/users/userValidators");
const { checkLogin } = require("../middlewares/common/checkLogin");
const checkAdmin = require("../middlewares/common/checkAdmin");

router.get(
  "/",
  decoreateHtmlResponse("Users"),
  checkLogin,
  checkAdmin,
  getUsers
);
router.post(
  "/",
  avatarUpload,
  addUserValidators,
  addUserValidationHandler,
  addUser
);
router.delete("/:id", removeUser);

module.exports = router;
