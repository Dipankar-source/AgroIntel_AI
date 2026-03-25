const express = require("express");
const isAuth = require("../../middlewares/isAuth");
const {
  createOrder,
  verifyPayment,
} = require("../../controllers/BillingController/billingController");

const router = express.Router();

router.post("/create-order", isAuth, createOrder);
router.post("/verify", isAuth, verifyPayment);

module.exports = router;

