/** Habit Atlas style reminder: Android ships the local-first fieldbook bundle, not a remotely hosted website. */
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.habitatlas.app",
  appName: "Habit Atlas",
  webDir: "dist/public",
  bundledWebRuntime: false,
  android: {
    backgroundColor: "#F7F2E9",
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_atlas",
      iconColor: "#2F63F5",
    },
  },
};

export default config;
