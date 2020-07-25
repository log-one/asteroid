const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  console.log("authing");
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");
  // res.status(400); //.redirect("/login");
  //RETURN TO LOGIN PAGE

  //verify jwt and return decoded payload
  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.body = decoded;
    console.log("Authorized", decoded);
    next();
  } catch (ex) {
    res.status(400).send("Invalid token"); //.redirect("http://localhost:3000/login");
    //RETURN TO LOGIN PAGE
  }
};
