const Order = require("../models/Order");
const OrderStatus = require("../models/OrderStatus");

exports.createPayment = async (req, res) => {
  const { school_id, trustee_id, student_info, order_amount } = req.body;

  try {
    const newOrder = new Order({
      school_id,
      trustee_id,
      student_info,
      gateway_name: "PhonePe",
    });
    await newOrder.save();

    const status = new OrderStatus({
      collect_id: newOrder._id,
      order_amount,
      transaction_amount: order_amount + 200,
      payment_mode: "upi",
      payment_details: "success@ybl",
      bank_reference: "YESBNK222",
      payment_message: "payment success",
      status: "success",
      error_message: "NA",
      payment_time: new Date(),
    });
    await status.save();

    res.json({ message: "Payment created", orderId: newOrder._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTransactions = async (req, res) => {
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
    ]);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
