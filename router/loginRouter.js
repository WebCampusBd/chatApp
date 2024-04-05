// external imports
const express = require("express");
const router = express.Router();

// internal imports
const { getLogin, login, logout } = require("../controllers/loginController");
const decoreateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const {
  doLoginValidators,
  doLoginValidation,
} = require("../middlewares/login/loginValidators");
const { redirectLoggedIn } = require("../middlewares/common/checkLogin");

router.get("/", decoreateHtmlResponse("Login"), redirectLoggedIn, getLogin);

router.post(
  "/",
  decoreateHtmlResponse("Login"),
  doLoginValidators,
  doLoginValidation,
  login
);

router.delete("/", logout);

module.exports = router;
