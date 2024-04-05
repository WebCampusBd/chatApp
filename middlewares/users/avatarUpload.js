const uploader = require("../../utilities/singleUploader");
const avatarUpload = (req, res, next) => {
  const upload = uploader(
    "avatars",
    1000000,
    ["image/jpg", "image/jpeg", "image/png"],
    "Only .jpg, jpeg or .png format allowed!"
  );

  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
};

module.exports = avatarUpload;
