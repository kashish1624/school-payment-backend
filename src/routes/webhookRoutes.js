const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");

// Webhook endpoint - payment gateway will call this
router.post("/", async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    if (!transactionId || !status) {
      return res.status(400).json({ message: "Missing transactionId or status" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Update transaction status
    transaction.status = status;
    await transaction.save();

    res.json({ message: "Webhook received, transaction updated", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

