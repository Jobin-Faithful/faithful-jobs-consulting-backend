
const router = require("express").Router();
const employerController = require("./employer.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.post("/register", employerController.register);
router.post("/login", employerController.login);
router.post(
  "/logout",
  authMiddleware("employer"),
  employerController.logout
);

module.exports = router;
