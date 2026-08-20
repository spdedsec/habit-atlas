# Habit Atlas v0.1.0 Delivery Package

This delivery package contains the production-ready source code, a device-testable Android APK, and an Android App Bundle for Play Console submission. Habit data remains local to the device by design; no account, external analytics, or cloud database is required for the shipped application.

| Artifact | Intended use | Release status |
| --- | --- | --- |
| `HabitAtlas-v0.1.0-debug.apk` | Install directly on an Android phone or emulator for functional testing. | Debug-signed and installable; do not upload to Google Play. |
| `HabitAtlas-v0.1.0-release-unsigned.aab` | Submit to Google Play after signing with the owner’s upload key. | Unsigned release bundle; not installable directly. |
| `HabitAtlas-v0.1.0-source.zip` | Continue product development, auditing, or CI setup. | Full source, including the Capacitor Android project; excludes dependencies and build caches. |
| `SHA256SUMS.txt` | Confirm downloads were not corrupted or changed. | Generated with the release artifacts. |

> Keep the Play upload key outside this source archive. It must be generated and controlled by the product owner; this workspace does not create, retain, or expose private signing material.

To test the APK, transfer it to an Android device and approve the system prompt for an app installed from an external source. To publish, configure a Play Console app entry, sign the AAB with the owner’s upload key, then upload the signed bundle to an internal test track before a wider release.
