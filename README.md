# CMSMobileApp

Ionic mobile app (Ionic React + Capacitor) for tracking chemical shipments between warehouses and field deliveries. Auth and data are backed by Firebase (Firebase Auth + Firestore).

## Required versions

| Tool            | Version          | Notes                                                       |
| --------------- | ---------------- | ----------------------------------------------------------- |
| Node.js         | **18.x or 20.x** | Required by Vite 5 and `@types/node ^20`                    |
| npm             | 9.x or 10.x      | Ships with Node 18/20                                       |
| Ionic Framework | **8.x** (`@ionic/react`) | Pinned via `package.json`                           |
| Capacitor       | **6.x**          | Plugin imports are per-package (e.g. `@capacitor/preferences`) |
| TypeScript      | 5.x              | Pinned via `package.json`                                   |
| Java JDK        | **17**           | Required by Android Gradle Plugin 8 / Capacitor 6           |
| Android SDK     | compileSdk **34** | Install via Android Studio Hedgehog+                       |
| Xcode           | 15+              | iOS builds only; Mac required                               |

> Node 16 will not work — Vite 5 requires Node 18+.

## Setup

```bash
git clone <repo-url>
cd CMSMobileApp
npm install
```

Before the app will boot, restore the Firebase web SDK config in [src/firebaseConfig.ts](src/firebaseConfig.ts) (it was stripped from the repo in commit `b2f6800`). Do **not** commit real credentials back — wire them through environment variables (Vite exposes any var prefixed with `VITE_` as `import.meta.env.VITE_*`) or a gitignored file.

## Running

- `npm start` (or `npm run dev`) — Vite dev server at http://localhost:3000 with HMR
- `npm run build` — type-check (`tsc --noEmit`) then production build to `build/` (the `webDir` Capacitor consumes)
- `npm run preview` — serve the production build locally
- `npx cap sync android` — copy the latest `build/` into the Android project
- `npx cap sync ios` — same for iOS
- `npx cap open android` — open the native Android project in Android Studio
- `npx cap open ios` — open the Xcode workspace (Mac only)

## Testing

There is no test runner configured. The Jest + @testing-library/react setup that shipped with Create React App was removed in the Vite migration. To add tests back, install [Vitest](https://vitest.dev) and `@testing-library/react`, then add a `vitest` script.

## Project structure

- [src/pages/](src/pages/) — route-level screens (Login, Dashboard, ShippingPapers, Delivery, CloseShpping)
- [src/api/](src/api/) — Firestore queries grouped by collection
- [src/redux/](src/redux/) — single-slice Redux store (`user.username`)
- [src/storage/](src/storage/) — Capacitor `Preferences` wrappers (auth tokens, in-progress shipping paper)
- [android/](android/) — generated Capacitor Android project (regenerate after Capacitor 6 upgrade with `npx cap add android`)
- [ios/](ios/) — generated Capacitor iOS project (`npx cap add ios` to scaffold)
- [vite.config.ts](vite.config.ts) — Vite config (sets `outDir: 'build'` and `server.port: 3000`)

See [CLAUDE.md](CLAUDE.md) for a deeper architecture overview, including the shipping-paper lifecycle and Firestore data model.
