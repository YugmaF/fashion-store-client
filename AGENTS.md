# AGENTS.md

Guidance for AI agents and contributors working on **fashion-store-client** — the React SPA frontend of a fashion e-commerce application (pairs with a backend API served at the URL in `REACT_APP_API_URL`).

## Project Overview

- **Stack**: React 16 (class components dominate), Create React App (`react-scripts` 3.4), React Router 5.
- **UI libraries**: Material-UI v4, Bootstrap 4 / react-bootstrap, Semantic UI, MDB React, Font Awesome. Multiple coexisting UI kits — match the library already used by the file you are editing.
- **State**: No Redux. State is kept in component state; cart and wishlist are persisted in `localStorage` via helper modules.
- **Auth**: JWT stored in `localStorage` under `userToken`; role-based route guarding.
- **Payments**: Braintree Drop-in (`braintree-web-drop-in-react`) and Cash on Delivery.
- **Backend contract**: All endpoints are called from dedicated API modules (`src/admin/ApiAdmin.js`, `src/user/apiUser.js`, `src/core/apiCore.js`) using `fetch` against `${API}` (from `src/config.js` → `REACT_APP_API_URL`, default `http://localhost:8000/api`). Authenticated calls pass `Authorization: Bearer ${token}`.

## Commands

```bash
npm install        # install dependencies (no lockfile-regen; package-lock.json is committed)
npm start          # dev server at http://localhost:3000 (CRA, hot reload)
npm test           # Jest + React Testing Library (watch mode)
npm run build      # production build to /build
```

There is no lint script; ESLint runs via `react-scripts` (eslint-config `react-app`).

## Project Structure

```
src/
├── Routes.js          # Single central route table (BrowserRouter + Switch). All routes live here.
├── index.js           # CRA entry point
├── config.js          # Exports API base URL from REACT_APP_API_URL
├── auth/              # Route guards + auth helpers
│   ├── index.js       # signup/signin/signout, authenticate(), isAuthenticate() (localStorage JWT)
│   ├── PrivateRoute.js        # any authenticated user
│   ├── AdminRoute.js          # role === 1 (admin)
│   └── StoreManagerRoute.js   # role === 1 or 2 (admin or store manager)
├── core/              # Customer-facing pages & shared UI
│   ├── apiCore.js     # fetch wrappers for public/user endpoints
│   ├── CartHelper.js / WishlistHelper.js   # localStorage cart & wishlist logic
│   ├── Home, Shop, Product, Cart, Checkout, Wishlist, CashOnDelivery
│   └── Menu, NavBar, Footer, Layout, Page404, ShowImage, etc.
├── user/              # Auth pages & dashboards
│   ├── apiUser.js     # user-profile fetch wrappers
│   └── Signup, Signin, Profile, UserDashboard, AdminDashboard
├── admin/             # Admin/store-manager pages
│   ├── ApiAdmin.js    # fetch wrappers for admin endpoints (categories, products, orders, users)
│   └── AddProduct, UpdateProduct, ManageProducts, AddCategory, ManageCategories,
│       UpdateCategory, Orders, AddAdminUser, ManageAdminUser, Pagination
├── autocomplete/      # Category autocomplete component
├── assets/            # Per-component static asset bundles (CSS/fonts/imgs), incl. vendored bootstrap/jquery
└── images/            # Shared images
```

## Architecture & Design Patterns

- **Feature-folder organization**: `core/` (customer), `user/` (auth/dashboards), `admin/` (management). Put new code in the matching folder.
- **API-layer pattern**: components never call `fetch` inline. Add endpoints to the relevant API module (`apiCore.js`, `apiUser.js`, `ApiAdmin.js`) as named exported functions that return promises, e.g. `export const getProducts = (sortBy) => fetch(...)`. Components import and call them in `componentDidMount` / effects.
- **Route-guard pattern**: wrap protected routes in `Routes.js` with `PrivateRoute`, `AdminRoute`, or `StoreManagerRoute`. Roles are integers on the JWT user object (`0` = regular user, `1` = admin, `2` = store manager; store-manager pages accept roles 1 and 2). Unauthenticated users are redirected to `/signin` with `state.from` preserved.
- **localStorage persistence pattern**: cart & wishlist helpers read/modify/write a JSON array under `cart` / `wishlist` keys and invoke a `next()` callback after mutation. Reuse `CartHelper`/`WishlistHelper` and `isAuthenticate()` rather than touching `localStorage` directly.
- **Class components**: the codebase is predominantly React class components with `componentDidMount` data fetching. Follow the existing style of the file; don't refactor to hooks as a side effect of other changes.
- **Routing**: every route is declared centrally in `src/Routes.js` with `exact`; unknown paths fall through to `Page404`.

## Conventions

- JSX files use **PascalCase** component filenames (e.g. `ManageProducts.js`); helper/API modules use camelCase (`apiCore.js`, `CartHelper.js`).
- API modules export named functions; components import them individually.
- Keep the endpoint URL structure consistent with existing calls (e.g. `${API}/product/${productId}/${userId}` for admin-scoped actions, where `userId` identifies the calling user for backend authorization).
- Do not commit `.env` values beyond the local dev defaults; `.env` currently holds `REACT_APP_API_URL`.

## Branching Strategy

The repository uses a lightweight **trunk-based workflow around a single long-lived `master` branch**:

- `master` is the only permanent branch and always deployable. `origin/HEAD` points to it.
- Work is committed directly to `master` by team members; since collaborators push in parallel, frequent `git pull` merges produce the "Merge branch 'master' of https://github.com/…" merge commits seen in history. **Pull/rebase from `origin/master` before pushing** to keep these merges trivial.
- Commit messages are short, imperative summaries (e.g. `signup view change`, `layout color`, `Minor changes in Rate and ManageUsers`). Keep messages concise and describe the change in one line.
- Automated dependency updates arrive as **Dependabot branches** (`dependabot/npm_and_yarn/<pkg>-<version>`) and are merged into `master` after review — don't edit these branches by hand.
- Short-lived task branches may be cut from `master` for larger changes (pattern: `task/<name>` or agent-generated task branches); merge them back into `master` promptly and delete after merge. Do not create long-lived feature branches or release branches.

## Testing

- `src/App.test.js` is the only existing test; CRA's Jest + React Testing Library setup is configured in `package.json` (`@testing-library/*` deps, `setupTests.js`).
- When adding features, add colocated tests named `*.test.js` next to the component. `npm test` runs in watch mode; use `CI=true npm test` for a single run.

## Agent Notes

- CRA 3.4 / React 16 are pinned — do not upgrade tooling or dependencies as part of unrelated tasks.
- Node 12–14 era toolchain: if `npm start`/`npm install` fails on modern Node, retry with an older Node LTS.
- The `src/assets/**` folders are vendored per-component bundles (Bootstrap/jQuery copies). Avoid refactoring them; treat them as static assets.
- `App.js` is essentially unused (routing lives in `Routes.js` mounted from `index.js`) — don't add routes there.
