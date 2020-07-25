//create the router object
const config = require("config");
const express = require("express");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { getUser } = require("../users");

// handle post request to login and authenticate existing user
router.post("/", async (req, res) => {
  //validate form data
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //validate existence of username in database
  let user = await getUser(req.body.name);
  if (!user) return res.status(400).send("Invalid username or password.");

  //validate password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send("Invalid username or password.");

  const token = user.genAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(user);
});

function validate(req) {
  const schema = {
    name: Joi.string().min(1).max(15).required(),
    password: Joi.string().min(8).max(50).required(),
  };

  return Joi.validate(req, schema);
}

module.exports = router;
