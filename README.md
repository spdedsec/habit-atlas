# Habit Atlas

Habit Atlas is a **private, local-first habit fieldbook** built as a responsive web application and Capacitor Android app. The product records habits, schedules, measurements, contribution history, goals, daily notes, and settings in the device’s local IndexedDB database. It works without an account, remote habit API, advertising SDK, or behavioral-data sync.

The project is intentionally organized around a data hierarchy: **IndexedDB → deterministic habit engine → React UI → optional native device integrations**. This means a mark survives refreshes and can be exported by its owner even when no network is available.

| Area | Included implementation |
|---|---|
| Daily habit loop | Create, archive, complete, undo, and increment measurable habits. |
| Scheduling | Daily, weekdays, selected days, every-*n* days, weekly target, and monthly target models. |
| Visual history | A touchable four-level contribution heatmap, calendar record, streaks, and on-device insights. |
| Local data | Versioned Dexie/IndexedDB schema for habits, completions, routines, goals, daily notes, and preferences. |
| Data control | JSON backup/restore, CSV history export, local clearing, and explicit privacy information. |
| PWA | Web manifest, icon, cached app shell, and service worker registration. |
| Android | Capacitor project, local-notification permission path, deep-link actions, native widget snapshot bridge, debug APK, and release AAB output. |

## Run the responsive web application

```bash
pnpm install
pnpm dev
```

Use `pnpm run check` for TypeScript validation and `pnpm run build` for a production web bundle.

## Build Android

The native project is under `android/`. The reproducible build commands are recorded below; use an Android SDK with API 36 and Java 21.

```bash
pnpm run android:sync
cd android
JAVA_HOME=/path/to/java-21 ANDROID_HOME=/path/to/android-sdk ./gradlew assembleDebug --no-daemon
JAVA_HOME=/path/to/java-21 ANDROID_HOME=/path/to/android-sdk ./gradlew bundleRelease --no-daemon
```

The generated debug APK is installable for testing. The release AAB must be signed with your private Play upload key before Google Play submission. See [Android build guidance](docs/ANDROID.md), [architecture](docs/ARCHITECTURE.md), and [release notes](docs/RELEASE_NOTES.md) for the complete handoff.
