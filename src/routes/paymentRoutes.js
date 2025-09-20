const express = require("express");
const { createPayment, getTransactions } = require("../controllers/paymentController");
const router = express.Router();

// Optional: If you have auth middleware, you can import it
// const auth = require("../middleware/authMiddleware");

/**
 * @route   POST /api/payment/create-payment
 * @desc    Create a new payment (Order + OrderStatus)
 * @access  Public (or use auth middleware if needed)
 */
router.post("/create-payment", createPayment);

/**
 * @route   GET /api/payment/transactions
 * @desc    Get all transactions with order info
 * @access  Public
 */
router.get("/transactions", getTransactions);

/**
 * @route   GET /api/payment/status/:orderId
 * @desc    Check payment status by Order ID
 * @access  Public (or protected)
 */
// Uncomment auth if you want authentication
// router.get("/status/:orderId", auth, async (req, res) => {
router.get("/status/:orderId", async (req, res) => {
  const OrderStatus = require("../models/OrderStatus");
  try {
    const status = await OrderStatus.findOne({ collect_id: req.params.orderId });

    if (!status) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      orderId: status.collect_id,
      status: status.status,
      order_amount: status.order_amount,
      transaction_amount: status.transaction_amount,
      student_info: status.student_info || "N/A",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
