import User from "@/models/User";
import { DateTime } from "luxon";
import cron from "node-cron";

export async function cleanupUnverifiedUsers() {
  const twentyFourHoursAgo = DateTime.now().minus({ hours: 24 }).toJSDate();
  const result = await User.deleteMany({
    isVerified: { $exists: true, $eq: false },
    createdAt: { $lt: twentyFourHoursAgo },
  });
  console.log(`Cleaned up ${result.deletedCount} unverified users`);
}

// Run every hour at the 0th minute
cron.schedule("0 * * * *", cleanupUnverifiedUsers);
