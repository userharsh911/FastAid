// utils/sendNotification.js
import { Expo } from "expo-server-sdk"
const expo = new Expo();

async function sendPushNotification(pushTokens, title, body, data = {}) {
  // Valid tokens filter karo
  const messages = pushTokens
    .filter(token => Expo.isExpoPushToken(token))
    .map(token => ({
      to: token,
      sound: "default",
      title,
      body,
      data, // extra info bhej sakte ho
    }));

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    try {
      await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      console.error("Notification error:", err);
    }
  }
}
export default sendPushNotification;