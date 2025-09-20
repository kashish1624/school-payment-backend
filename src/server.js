const dotenv = require("dotenv");
dotenv.config();


const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const paymentRoutes = require("./routes/paymentRoutes");


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Debug
console.log("Mongo URI from .env:", process.env.MONGO_URI);

console.log("All env vars:", process.env);


// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/payment", require("./routes/paymentRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));
app.use("/api/webhook", require("./routes/webhookRoutes"));
app.use("/api/payments", paymentRoutes);
app.use("/api/webhook", require("./routes/webhookRoutes"));


// DB + Server
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected");
        app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));
    })
    .catch(err => console.log(err));
