# Habit Atlas Architecture

Habit Atlas is deliberately a **local-first, offline-capable web application**. The browser’s IndexedDB database is authoritative for habits, schedules, completion history, routines, goals, notes, and preferences. The app does not need an account and it does not make behavioral-data requests. This follows the brief’s data hierarchy: **local database → deterministic habit engine → UI → optional device integrations**.

| Concern | Decision | Rationale |
|---|---|---|
| Web framework | React + TypeScript + Vite | Responsive component model with a compact static build. |
| Local persistence | Dexie over IndexedDB | IndexedDB is designed for structured browser persistence, and Dexie supplies typed querying plus schema versioning. |
| Data model | Normalized stores for habits, completions, routines, goals, daily notes, and settings | History remains separate from habit metadata, so edits and archives preserve the record. |
| Date policy | Local calendar date keys (`YYYY-MM-DD`) derived at local noon | Avoids the common UTC-midnight shift; timestamps remain available for audit fields. |
| Schedules | Deterministic local schedule evaluator | Daily, selected-day, interval, weekly-target, and monthly-target rules are independent of connectivity. |
| PWA | Manifest, service worker, cached app shell, IndexedDB | Enables installation and continued use after a browser restart or loss of network. |
| Android | Capacitor wrapper with native notification/share/app hooks | Reuses the local-first app logic while allowing Android-specific integrations and an APK/AAB build pipeline. |

## Database migrations

The database is named `habit-atlas`. Version 1 introduced `habits`, `completions`, and `settings`. Version 2 added `routines`, `goals`, and `dailyNotes`. Future migrations must add a new Dexie version, preserve existing stores, and include a transformation only when a stored record’s shape changes. A migration must be tested using an export from the prior version before release.

## Android boundary

The Capacitor Android project is a native Android container for the compiled local-first web bundle. It is not a remote website: the bundle ships with the application; IndexedDB data stays on-device; Android integrations are invoked only through the supported native bridge. Native widgets require a native Kotlin widget module and shared data bridge, included as a documented next Android milestone because it cannot be represented reliably by a browser-only widget surface.

## Feature-gap decisions

Loop validates the value of offline usage, flexible schedules, per-habit reminders, widgets, and portable CSV/SQLite exports [1]. The Streak project adds practical reference points for amount habits, historical editing, GitHub-style grids, local backup, and direct widget/notification actions [2]. Habit Atlas differentiates itself by treating **measurement intensity**, contribution history, humane recovery language, import validation, and a private PWA/Android architecture as one coherent system. A reusable SVG heatmap can support custom intensity scales, labels, legends, hover content, and cell interaction [3], but Habit Atlas implements its own DOM-grid view to keep touch targets, semantics, and local editing behavior under direct control.

## Privacy model

Habit Atlas does not ship with an analytics SDK, advertisement SDK, account requirement, remote habit database, or cloud synchronization. The only optional device-level operations are scheduled local notifications and user-initiated export/share actions. Future encrypted backup must encrypt on the client before any transfer and must remain optional.

## References

[1]: https://github.com/iSoron/uhabits "Loop Habit Tracker repository"
[2]: https://github.com/InlitX/streak "Streak Android habit tracker repository"
[3]: https://github.com/uiwjs/react-heat-map "react-heat-map repository"
