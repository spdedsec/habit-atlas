# Habit Atlas v0.1.0 — Local-first foundation

This release establishes the working product foundation requested in the brief: a polished responsive web experience, an offline-friendly data model, and an Android Capacitor container with debug APK and release AAB builds. The mobile and desktop interfaces use the same fieldbook model rather than separate mockups.

| Deliverable | Validation status | Notes |
|---|---|---|
| Responsive website | Verified at desktop and 390 × 844 mobile viewport | Supports empty-state onboarding, habit creation, measurement logging, heatmap history, calendar, insights, goals, settings, import, export, privacy, and theme selection. |
| TypeScript | Passed `pnpm run check` | No compiler errors at delivery. |
| Production web bundle | Passed `pnpm run build` | Capacitor synchronization completed from the production bundle. |
| Debug APK | Built and archive-validated | `app-debug.apk` is signed with the Android debug key and intended for local installation/testing. |
| Release AAB | Built and archive-validated | `app-release.aab` is an unsigned release bundle and must be signed with the owner’s private Play upload key before publication. |
| Android native features | Build-validated | Includes app ID, deep-link scheme, notification permission declaration, local reminder capability, and native widget snapshot/provider scaffold. Device testing remains required. |

## Build artifacts

| Artifact | SHA-256 | Purpose |
|---|---|---|
| `habit-atlas-v0.1.0-debug.apk` | `e4b7737f5347155a649851bd646e10e6488dd5f862f7e6867026e1529b7a04ca` | Direct Android installation on a test device. |
| `habit-atlas-v0.1.0-unsigned.aab` | `f12186f556d9884c75ce75fca0302f6f96b5f493b9d9d1f08e58df2d996cd48a` | Release bundle to sign with the owner-controlled upload key. |

## Remaining device-release checks

The web behavior and Android compilation are validated, but release confidence also requires a physical device or Android emulator. Test a fresh install; closing and reopening the app; offline/airplane-mode operation; permission denied and granted paths; notification timing; system back navigation; light/dark appearance; backup import/export; deep-link behavior; and widget refresh after a habit is marked. Verify database migration from an older installed build before a subsequent public release.

> The release bundle intentionally does not include a production signing key. A Play upload key is a durable owner credential and must remain outside the source repository and this handoff package.
