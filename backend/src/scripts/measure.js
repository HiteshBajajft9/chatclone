// Measures the chat-history query. Run the same script before AND after the fix.
// Run from the backend folder:  node src/scripts/measure.js
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Message from "../models/Message.js";

const MONGO_URI = process.env.MONGO_URL;
await mongoose.connect(MONGO_URI);
await Message.init(); // builds the indexes defined in the model and waits for them

const me = await User.findOne({ email: "loadtest@test.com" });
const partner = await User.findOne({ email: "seeduser1@seed.test" });
const query = {
  $or: [
    { senderId: me._id, receiverId: partner._id },
    { senderId: partner._id, receiverId: me._id },
  ],
};

const total = await Message.countDocuments();
const indexes = (await Message.collection.indexes()).map((i) => JSON.stringify(i.key));
console.log(`Messages in DB: ${total}`);
console.log(`Indexes on messages: ${indexes.join(", ")}\n`);

const runs = 5;
const time = async (label, makeQuery) => {
  await makeQuery().lean(); // warm-up run
  let ms = 0,
    count = 0,
    bytes = 0;
  for (let i = 0; i < runs; i++) {
    const t = performance.now();
    const docs = await makeQuery().lean();
    ms += performance.now() - t;
    count = docs.length;
    bytes = JSON.stringify(docs).length;
  }
  const ex = await makeQuery().explain("executionStats");
  const stats = ex.executionStats || ex[0]?.executionStats;
  console.log(`${label}`);
  console.log(`  avg total time (${runs} runs): ${(ms / runs).toFixed(1)} ms`);
  console.log(`  DB execution time:           ${stats.executionTimeMillis} ms`);
  console.log(`  docs examined:               ${stats.totalDocsExamined}`);
  console.log(`  docs returned:               ${count}`);
  console.log(`  response size:               ${(bytes / 1024).toFixed(0)} KB\n`);
};

await time("A) Current: load whole chat", () => Message.find(query).sort({ createdAt: 1 }));
await time("B) Latest 50 messages only", () =>
  Message.find(query).sort({ createdAt: -1 }).limit(50)
);

await mongoose.disconnect();
