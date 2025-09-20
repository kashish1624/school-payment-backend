const express = require("express");
const router = express.Router();
const OrderStatus = require("../models/OrderStatus");
const Order = require("../models/Order");
const WebhookLog = require("../models/WebhookLog");
const jwt = require("jsonwebtoken");
const axios = require("axios");

/**
 * Auto-generate next customer order id
 * Example: CUST001, CUST002, etc.
 */
async function generateCustomerOrderId() {
  const last = await OrderStatus.findOne().sort({ createdAt: -1 });
  if (!last || !last.customer_order_id) {
    return "CUST001";
  }
  const lastNum = parseInt(last.customer_order_id.replace("CUST", "")) || 0;
  const nextNum = lastNum + 1;
  return "CUST" + String(nextNum).padStart(3, "0");
}

/**
 * @route   POST /api/transactions
 * @desc    Create new order + transaction
 */
router.post("/", async (req, res) => {
  try {
    const {
      school_id,
      trustee_id,
      student_info,
      gateway_name,
      order_amount,
      transaction_amount,
      payment_mode,
      payment_details,
      bank_reference,
      payment_message,
      status,
    } = req.body;

    // Step 1: Create Order
    const order = new Order({
      school_id,
      trustee_id,
      student_info,
      gateway_name,
    });
    await order.save();

    // Step 2: Generate unique customer_order_id
    const customer_order_id = await generateCustomerOrderId();

    // Step 3: Create OrderStatus
    const newStatus = new OrderStatus({
      collect_id: order._id,
      order_amount,
      transaction_amount,
      payment_mode,
      payment_details,
      bank_reference,
      payment_message,
      status,
      error_message: "NA",
      payment_time: new Date(),
      customer_order_id,
    });
    await newStatus.save();

    res.status(201).json({
      message: "Transaction created",
      order,
      transaction: newStatus,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/transactions
 * @desc    Get all transactions with order details
 */
router.get("/", async (req, res) => {
  try {
    const transactions = await OrderStatus.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "collect_id",
          foreignField: "_id",
          as: "order_info",
        },
      },
      { $unwind: "$order_info" },
      {
        $project: {
          _id: 1,
          collect_id: 1,
          order_amount: 1,
          transaction_amount: 1,
          payment_mode: 1,
          payment_details: 1,
          bank_reference: 1,
          payment_message: 1,
          status: 1,
          error_message: 1,
          payment_time: 1,
          createdAt: 1,
          updatedAt: 1,
          customer_order_id: 1,
          order_info: {
            _id: "$order_info._id",
            school_id: "$order_info.school_id",
            trustee_id: "$order_info.trustee_id",
            student_info: "$order_info.student_info",
            gateway_name: "$order_info.gateway_name",
            createdAt: "$order_info.createdAt",
            updatedAt: "$order_info.updatedAt",
          },
        },
      },
    ]);

    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/transactions/:orderId/status
 * @desc    Get status of a transaction by collect_id OR customer_order_id
 */
router.get("/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    let status;

    // Match by ObjectId (collect_id)
    if (/^[0-9a-fA-F]{24}$/.test(orderId)) {
      status = await OrderStatus.findOne({ collect_id: orderId });
    }

    // Or match by customer_order_id
    if (!status) {
      status = await OrderStatus.findOne({ customer_order_id: orderId });
    }

    if (!status) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({
      collect_id: status.collect_id,
      customer_order_id: status.customer_order_id,
      status: status.status,
      order_amount: status.order_amount,
      transaction_amount: status.transaction_amount,
      payment_time: status.payment_time,
    });
  } catch (error) {
    console.error("Error in /status route:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/transactions/:id
 * @desc    Delete a transaction by ID
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // delete from OrderStatus
    const deleted = await OrderStatus.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
});




router.post("/webhook", async (req, res) => {
  try {
    const payload = req.body;

    // Log webhook
    await WebhookLog.create({ payload });

    // Extract order info
    const orderInfo = payload.order_info;
    if (!orderInfo) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    // Update OrderStatus
    await OrderStatus.findOneAndUpdate(
      { collect_id: orderInfo.order_id },
      {
        order_amount: orderInfo.order_amount,
        transaction_amount: orderInfo.transaction_amount,
        payment_mode: orderInfo.payment_mode,
        payment_details: orderInfo.payment_details,
        bank_reference: orderInfo.bank_reference,
        payment_message: orderInfo.payment_message,
        status: orderInfo.status,
        error_message: orderInfo.error_message,
        payment_time: orderInfo.payment_time,
      },
      { upsert: true, new: true }
    );

    res.json({ message: "Webhook processed successfully" });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ message: "Webhook failed" });
  }
});


router.post("/create-payment", async (req, res) => {
  try {
    const { amount, student, school_id } = req.body;

    // Generate custom_order_id
    const count = await OrderStatus.countDocuments();
    const customer_order_id = `CUST${(count + 1).toString().padStart(3, "0")}`;

    // JWT payload for Payment API
    const payload = {
      amount,
      student,
      school_id,
      pg_key: process.env.PG_KEY,
      order_id: customer_order_id,
    };

    const signed = jwt.sign(payload, process.env.API_KEY);

    // Call external payment API
    const response = await axios.post("https://sandbox.paymentapi.com/create-collect-request", {
      payload: signed,
    });

    // Save to DB
    const newOrder = await Order.create({
      school_id,
      student_info: student,
      gateway_name: "PhonePe",
      custom_order_id: customer_order_id,
    });

    await OrderStatus.create({
      collect_id: newOrder._id,
      order_amount: amount,
      transaction_amount: amount,
      status: "pending",
      customer_order_id,
    });

    res.json({
      payment_url: response.data.payment_url,
      customer_order_id,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    res.status(500).json({ message: "Failed to create payment" });
  }
});

module.exports = router;
