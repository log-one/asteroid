const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");

router.get("/", auth, (req, res) => {
  res.send(req.body.name);
  console.log("WTF A GET REQUEST");
});

module.exports = router;
