const express = require("express");
const router = express.Router();
const UserControllers = require("../controllers/users");
const auth = require("../middleware");

router.post("/signup", UserControllers.SignupUserController);

router.post("/login", UserControllers.LoginUserController);

router.patch("/changeEmail", auth, UserControllers.UpdateEmailUserController);

router.delete("/delete", auth, UserControllers.DeleteUserController);

module.exports = router;
