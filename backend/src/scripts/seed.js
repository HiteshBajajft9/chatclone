// Seeds test users + 50,000 messages for performance testing.
// Run from the backend folder:  node src/scripts/seed.js
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGO_URI = process.env.MONGO_URL;
const TOTAL_MESSAGES = 50000;
const MAIN_CHAT_MESSAGES = 10000; // messages between loadtest and seeduser1 (the chat we measure)
const BATCH = 5000;

await mongoose.connect(MONGO_URI);
console.log("Connected");

const me = await User.findOne({ email: "loadtest@test.com" });
if (!me) throw new Error("loadtest@test.com not found. Sign it up first.");

if (await User.findOne({ email: "seeduser1@seed.test" })) {
  console.log("Already seeded. Run cleanup.js first if you want to reseed.");
  process.exit(0);
}

// 20 test users, all with password test123456
const hashed = await bcrypt.hash("test123456", 10);
const seedUsers = await User.insertMany(
  Array.from({ length: 20 }, (_, i) => ({
    username: `seeduser${i + 1}`,
    email: `seeduser${i + 1}@seed.test`,
    password: hashed,
  }))
);
const partner = seedUsers[0];
const everyone = [me, ...seedUsers];
console.log("Created 20 seed users");

const yearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
const randomDate = () => new Date(yearAgo + Math.random() * (Date.now() - yearAgo));
const pick = () => everyone[Math.floor(Math.random() * everyone.length)];

const messages = mongoose.connection.collection("messages");
let batch = [];
for (let i = 0; i < TOTAL_MESSAGES; i++) {
  let sender, receiver;
  if (i < MAIN_CHAT_MESSAGES) {
    [sender, receiver] = i % 2 === 0 ? [me, partner] : [partner, me];
  } else {
    sender = pick();
    do {
      receiver = pick();
    } while (receiver._id.equals(sender._id));
  }
  const at = randomDate();
  batch.push({
    senderId: sender._id,
    receiverId: receiver._id,
    text: `Test message ${i + 1}`,
    seed: true, // marks test data so cleanup.js can remove it
    createdAt: at,
    updatedAt: at,
  });
  if (batch.length === BATCH) {
    await messages.insertMany(batch);
    console.log(`Inserted ${i + 1} / ${TOTAL_MESSAGES}`);
    batch = [];
  }
}
if (batch.length) await messages.insertMany(batch);

console.log("Done seeding");
await mongoose.disconnect();
