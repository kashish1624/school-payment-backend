require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./src/models/User");
const Transaction = require("./src/models/Transaction");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected ✅");

    // 1️⃣ Clear existing users & transactions
    await User.deleteMany();
    await Transaction.deleteMany();

    // 2️⃣ Create a real user
    const hashedPassword = await bcrypt.hash("Kashish16", 10);
    const user = await User.create({
      username: "Kashish",
      email: "kashishgupta0216@gmail.com",
      password: hashedPassword,
    });

    // 3️⃣ Seed transactions for this user
    const seedTransactions = [
      {
        user: user._id, // <-- use real user ID
        school_id: "SCH001",
        trustee_id: "TR001",
        student_info: { name: "Aarav", id: "ST001", email: "aarav@example.com" },
        order_amount: 2500,
        status: "success",
      },
      {
        user: user._id,
        school_id: "SCH002",
        trustee_id: "TR002",
        student_info: { name: "Priya", id: "ST002", email: "priya@example.com" },
        order_amount: 3500,
        status: "pending",
      },
    ];

    await Transaction.insertMany(seedTransactions);
    console.log("✅ User and transactions seeded successfully!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedData();
