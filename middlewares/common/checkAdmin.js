const checkAdmin = (req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    res.redirect("/inbox");
  }
};

module.exports = checkAdmin;
