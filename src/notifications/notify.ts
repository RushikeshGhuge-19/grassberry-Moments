import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Moment } from "../engine/types";

// Expo Go (SDK 53+) dropped the native push-notification module, so these
// Notifications APIs can be undefined there even on native platforms —
// calling them directly would throw at import time, before the app (and
// the engine) ever renders. Guard defensively; a dev build has the real
// module and none of this changes behavior there.
if (Platform.OS !== "web" && typeof Notifications.setNotificationHandler === "function") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web" || typeof Notifications.requestPermissionsAsync !== "function") {
    return false;
  }
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

/** Fires a real system notification. This is the "Moment" surface on a phone
 * that doesn't have CarPlay/Live Activity — a genuine notification is the
 * honest equivalent, not a fake. */
export async function fireMomentNotification(moment: Moment) {
  if (Platform.OS === "web" || typeof Notifications.scheduleNotificationAsync !== "function") return;

  const body = moment.voucherOwned
    ? `${moment.brandName} — ${Math.round(moment.distanceM)}m away. You already have ₹${moment.voucherBalance} available.`
    : `${moment.brandName} — ${Math.round(moment.distanceM)}m away. ${moment.headline}.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Grassberry Nearby",
      body,
      data: { momentId: moment.id },
    },
    trigger: null, // fire immediately
  });
}