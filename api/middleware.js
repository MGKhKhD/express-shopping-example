const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "JWT_SECRET_SING");
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Auth failed"
    });
  }
};
