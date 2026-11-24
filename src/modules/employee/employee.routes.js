
const router = require("express").Router();
const employeeController = require("./employee.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

router.post("/register", employeeController.register);
router.post("/login", employeeController.login);
router.post(
  "/logout",
  authMiddleware("employee"),
  employeeController.logout
);

module.exports = router;
