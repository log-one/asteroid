const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

//handle protected route
router.get("/", auth, (req, res) => {
  console.log("WTF A GET REQUEST");
  res.send(true);
});

module.exports = router;
