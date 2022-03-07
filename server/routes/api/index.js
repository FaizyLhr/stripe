let router = require("express").Router();

router.use("/values", require("./values"));
router.use("/users", require("./users"));
router.use("/payment", require("./payment"));

module.exports = router;
