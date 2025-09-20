// models/WebhookLog.js
const mongoose = require("mongoose");

const WebhookLogSchema = new mongoose.Schema(
  {
    payload: { type: Object, required: true }, // store full webhook payload
    receivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WebhookLog", WebhookLogSchema);
