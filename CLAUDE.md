# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This is a Create React App (react-scripts 3.4.0) project wrapped with Ionic + Capacitor.

- `npm start` — dev server at http://localhost:3000
- `npm run build` — production build to `build/` (also the `webDir` consumed by Capacitor)
- `npm test` — runs Jest in watch mode (CRA default). Run a single test with `npm test -- --testPathPattern=App.test`
- `npx cap sync android` — copy the latest `build/` into the Android project after `npm run build`
- `npx cap open android` — open the native Android project in Android Studio

There is no separate lint script; ESLint runs through `react-scripts` (`eslintConfig.extends: react-app`).

## Firebase credentials (important)

[src/firebaseConfig.ts](src/firebaseConfig.ts) calls `firebase.initializeApp(config)` but the `config` object itself is not in the repo — it was stripped in commit `b2f6800 removed authentication tokens`. The app will not boot until a `config` object (Firebase web SDK config: apiKey, authDomain, projectId, etc.) is restored at the top of that file. Do not commit real credentials back; expect to wire this through environment variables or a gitignored file.

## Architecture

Single-page Ionic React app for tracking chemical shipments between warehouses and field deliveries. Auth is Firebase Auth; persistent data is Firestore; the active in-progress shipping paper is cached on-device via the Capacitor `Storage` plugin.

### Boot / routing flow
- [src/index.tsx](src/index.tsx) creates the Redux store and renders `<App/>`.
- [src/App.tsx](src/App.tsx) calls `getCurrentUser()` once on mount. If a Firebase user exists it dispatches `setUserState(user.email)` and `replaceState` to `/dashboard`; otherwise to `/login`. While that promise is pending it shows an `IonSpinner` instead of the router. All routes are flat (`/login`, `/dashboard`, `/shippingpapers`, `/closeshipping`, `/delivery`) — no nested routes, no auth guard component (the `replaceState` redirect on boot is the only gate).

### Redux store
- One slice, one action. [src/redux/actions.ts](src/redux/actions.ts) exports `setUserState(email)`; [src/redux/reducer.ts](src/redux/reducer.ts) handles `SET_USER_STATE` and stores `{ user: { username: email.split('@')[0] } }`. Pages read `state.user.username` via `useSelector`. There is no logout action — `logoutUser()` only clears Firebase auth, the Redux user is left stale.

### Firestore data model
All documents live in two collections: `assets` (master data) and `asset_data` (transactional records), discriminated by a `type` field. Known types:
- `assets` where `type` ∈ `warehouse | chemical | company | lease | well`
- `asset_data` where `type` ∈ `shipping_papers | shipping_chemical | warehouse_chemical | delivery | delivery_chemical`

Parent/child rows are linked by foreign-key fields stored on the child (`shippingid`, `deliveryid`, `warehouseid`). Lease rows reference their company via a `company` field; well rows reference their lease via a `lease` field — this is how [src/pages/Delivery.tsx](src/pages/Delivery.tsx) cascades the Company → Lease → Well selects from a single query that pulls all three types at once.

### The shipping-paper lifecycle
This is the central workflow and the reason the dashboard branches on `Storage.get('Shipping_paper')`:

1. **Create** — [src/pages/ShippingPapers.tsx](src/pages/ShippingPapers.tsx) writes a `shipping_papers` row plus one `shipping_chemical` row per chemical, decrements the matching `warehouse_chemical` rows at the origin, then stashes `{ data, chemicals, id }` in Capacitor Storage under key `Shipping_paper`. Sets `active: 0` on the parent.
2. **Branch** — [src/pages/Dashboard.tsx](src/pages/Dashboard.tsx) reads that key on mount; if present it shows Delivery + Close Shipping Paper, otherwise it shows Shipping Papers (you can only have one open shipping paper at a time per device).
3. **Deliver (repeatable)** — [src/pages/Delivery.tsx](src/pages/Delivery.tsx) writes a `delivery` + N `delivery_chemical` rows, decrements the locally-cached `chemicals` array on the Storage record (does NOT round-trip to Firestore for inventory), and re-saves it. Multiple deliveries can be drawn against one shipping paper.
4. **Close** — [src/pages/CloseShpping.tsx](src/pages/CloseShpping.tsx) (note: filename is misspelled, route is `/closeshipping`) increments the destination warehouse's `warehouse_chemical` rows by whatever quantities remain on the cached chemical list, sets the parent shipping paper's `active: 1`, then `Storage.clear()`s — which returns the dashboard to step 1.

Implication: `active: 0` means "in transit / open"; `active: 1` means "closed". The remaining-on-truck inventory lives only in device Storage between steps 3 and 4 — clearing app data mid-shipment loses it.

### Other notes
- [src/toast.ts](src/toast.ts) creates a raw `ion-toast` element and appends to `document.body` rather than using the React component — keep using this helper for one-off toasts.
- This pins **Capacitor 2** (`@capacitor/core ^2.4.2`), so plugins are accessed via `const { Plugins } = '@capacitor/core'; const { Storage, Geolocation } = Plugins`. Do not switch to the Capacitor 3+ `import { Storage } from '@capacitor/storage'` pattern without bumping the whole stack.
- Firebase 7 namespaced API (`firebase.initializeApp`, `fire.firestore().collection(...).where(...).onSnapshot(...)`). Do not mix in the modular v9 `getFirestore`/`collection`/`query` imports.
- React 16 + Ionic React 5 + react-router-dom 5 — `useHistory()` (not `useNavigate`), `<Route component={X}/>` (not `element={<X/>}`).
