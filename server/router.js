//create the router object
const express = require("express");
const router = express.Router();

//handle a simple get request
router.get("/", (req, res) => {
  res.send("server is up and running");
});

module.exports = router;
