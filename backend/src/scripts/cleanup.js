// Removes all test data created for performance testing.
// Run from the backend folder:  node src/scripts/cleanup.js
import "dotenv/config";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URL);
const db = mongoose.connection;

const testEmails = { $in: ["loadtest@test.com"] };
const testUsers = await db
  .collection("users")
  .find({ $or: [{ email: /@seed\.test$/ }, { email: testEmails }] })
  .project({ _id: 1 })
  .toArray();
const ids = testUsers.map((u) => u._id);

const msgs = await db.collection("messages").deleteMany({
  $or: [{ seed: true }, { senderId: { $in: ids } }, { receiverId: { $in: ids } }],
});
const users = await db.collection("users").deleteMany({ _id: { $in: ids } });

console.log(`Deleted ${msgs.deletedCount} test messages and ${users.deletedCount} test users`);
await mongoose.disconnect();
