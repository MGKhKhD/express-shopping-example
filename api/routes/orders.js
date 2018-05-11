const express = require("express");
const router = express.Router();
const OrdersControllers = require("../controllers/orders");

router.get("/", OrdersControllers.GetAllOrders);

router.post("/", OrdersControllers.PlaceANewOrder);

router.get("/:orderId", OrdersControllers.GetAnOrderById);

router.patch("/:orderId", OrdersControllers.UpdateOrder);

router.delete("/:orderId", OrdersControllers.DeleteOneOrder);

module.exports = router;
