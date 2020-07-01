const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401);
  res.status(400).redirect("/login");
  //RETURN TO LOGIN PAGE

  //verify jwt and return decoded payload
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.body = decoded;
    next();
  } catch (ex) {
    res.status(400).redirect("http://localhost:3000/login");
    //RETURN TO LOGIN PAGE
  }
};
