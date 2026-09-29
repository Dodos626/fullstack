# Change Log and Reconstruction Cookbook

This document records significant repository changes, why they were made, and how to reproduce the same architecture in another project. It is intentionally more descriptive than a conventional release log.

## How to Maintain This File

For every meaningful change, add a dated entry containing:

1. **Goal** — the problem or capability being addressed.
2. **Decision** — the chosen design and important alternatives that were rejected.
3. **Implementation** — the major files, modules, and data-flow changes.
4. **Reconstruction recipe** — the order in which another developer could build it again.
5. **Validation** — commands and checks that prove the change works.
6. **Limitations** — anything intentionally deferred or not verified.

Do not record secrets, real production credentials, or generated dependency directories.

---

## 2026-09-28 — Platform Foundation, Security, Subdomain Applications, and Developer Tooling

### Goal

Turn the existing portfolio and authentication prototype into a more reliable full-stack platform foundation while preserving the portfolio work already present.

The work addressed:

- Broken access-token refresh behavior.
- Sensitive user fields potentially reaching API responses.
- Frontend session data being trusted from `localStorage`.
- Conflicting authentication middleware implementations.
- Inconsistent Sequelize runtime and CLI configuration.
- Database constraints that did not match the Sequelize model.
- Invalid and non-repeatable development seed data.
- Incomplete subdomain application support.
- Missing `user` application and layout.
- Existing frontend lint failures and accessibility issues.
- Missing automated tests and root development commands.
- Docker services starting before their dependencies were ready.
- Portfolio content being embedded directly in presentation components.

Continuous integration was intentionally excluded from this change set.

## 1. Chosen Application Architecture

### Decision

Use one React/Vite frontend codebase and select the active application from the browser hostname.

Development host mapping:

| Host                | Application                | Access          |
| ------------------- | -------------------------- | --------------- |
| `lvh.me:5173`       | Public portfolio and login | Public          |
| `user.lvh.me:5173`  | User application           | User and admin  |
| `guest.lvh.me:5173` | Guest application          | Guest and admin |
| `admin.lvh.me:5173` | Admin application          | Admin           |

`lvh.me` was selected because it resolves to `127.0.0.1` and supports arbitrary local subdomains without editing the operating system's hosts file.

The API remains shared at `lvh.me:5000/api`. Frontend API requests include an `X-App-Name` header so the backend knows which browser application initiated a request even though all requests reach the same API hostname.

### Main files

- `frontend/src/config/apps.js`
- `frontend/src/routes/index.jsx`
- `frontend/src/routes/public.jsx`
- `frontend/src/routes/user.jsx`
- `frontend/src/routes/guest.jsx`
- `frontend/src/routes/admin.jsx`
- `frontend/vite.config.js`
- `backend/config/apps.config.js`
- `backend/middleware/subdomain.middleware.js`
- `backend/middleware/appAccess.middleware.js`

### Reconstruction recipe

1. Define an application map containing `public`, `user`, `guest`, and `admin`.
2. Add a frontend helper that:
    - Reads the current hostname.
    - Converts the hostname to an application name.
    - Builds URLs for every application.
    - Provides cross-subdomain navigation helpers.
3. Divide React routes into one route array per application.
4. At application startup, select only the route array matching the current hostname.
5. Allow every local hostname in the Vite development server.
6. Add `X-App-Name` to every Axios request.
7. On the backend, resolve the application from `X-App-Name` first and the hostname second.
8. Attach the resolved application configuration to the Express request.
9. Reject unknown applications and enforce each application's allowed roles on protected API routes.

### Why this design

- It keeps one deployable frontend while presenting distinct applications.
- Shared components, authentication state, themes, and styling remain reusable.
- Cross-subdomain behavior can be developed locally without DNS configuration.
- Backend authorization remains authoritative; frontend route guards are only a user-experience layer.

## 2. User Application and Role Layouts

### What changed

- Added a dedicated user application, route, layout, navigation, and starter page.
- Converted admin and guest routes from `/admin` and `/guest` paths to `/` on their own subdomains.
- Updated admin navigation so admins can open the user and guest applications.
- Updated role guards to redirect unauthenticated users to the public login page and unauthorized users to the public forbidden page.

### Main files

- `frontend/src/layouts/user/UserLayout.jsx`
- `frontend/src/layouts/user/UserLayout.module.css`
- `frontend/src/pages/landing/User.jsx`
- `frontend/src/routes/user.jsx`
- `frontend/src/routes/roleRoute.jsx`
- `frontend/src/layouts/admin/AdminLayout.jsx`
- `frontend/src/layouts/guest/GuestLayout.jsx`

### Reconstruction recipe

1. Create a layout for each role application.
2. Put shared logout and cross-application navigation behavior in the layouts.
3. Give each role application `/` as its home route.
4. Wrap protected pages in a role guard.
5. Perform redirects inside an effect rather than during React rendering.
6. Keep backend role checks in place even when frontend guards exist.

## 3. Authentication Lifecycle

### Previous problem

The refresh endpoint required a valid access token. That meant an expired access token could not be refreshed, which defeated the purpose of refresh tokens. Logout had the same dependency.

The frontend also persisted both the access token and user object in `localStorage`, allowing stale or modified browser state to be treated as an authenticated session.

### New lifecycle

1. The user submits credentials to `POST /api/auth/login`.
2. The API verifies the password hash.
3. The API returns a short-lived access token in the response body.
4. The API sets a longer-lived refresh token in an HTTP-only cookie.
5. Only a bcrypt hash of the active refresh token is stored in the database.
6. The frontend holds the access token in memory, not `localStorage`.
7. On page load, the frontend calls `POST /api/auth/refresh` to restore the session.
8. On a protected API `401`, Axios attempts one refresh and retries the original request.
9. Refresh rotates the refresh token and replaces its stored hash.
10. Logout clears the database hash and cookie without requiring a valid access token.

### Main files

- `backend/modules/auth/auth.controller.js`
- `backend/modules/auth/auth.service.js`
- `backend/modules/auth/auth.routes.js`
- `backend/modules/auth/auth.utils.js`
- `backend/middleware/verifyAuth.middleware.js`
- `backend/models/user.js`
- `frontend/src/api/client.js`
- `frontend/src/auth/AuthProvider.jsx`
- `frontend/src/hooks/useAuth.js`

### Important implementation details

- Access tokens include the user ID and role.
- Refresh tokens include only the user ID.
- Both token types validate issuer and audience claims.
- The refresh cookie is HTTP-only and limited to `/api/auth`.
- `COOKIE_DOMAIN=.lvh.me` allows the same development session to work across role subdomains.
- Production requires explicit access and refresh secrets.
- Authentication errors use generic messages such as `Invalid credentials`.
- Refresh and logout routes do not pass through access-token middleware.

### Reconstruction recipe

1. Add separate access and refresh JWT secrets.
2. Create token generators with different payloads and expiration periods.
3. Add a nullable `refreshTokenHash` field to the user table.
4. During login:
    - Validate input.
    - Verify the password.
    - Generate both tokens.
    - Hash and save the refresh token.
    - Set the refresh cookie.
    - Return the access token and a safe user object.
5. During refresh:
    - Read the cookie.
    - Verify the refresh JWT.
    - Load the user.
    - Compare the cookie to the stored hash.
    - Rotate the refresh token.
    - Return a new access token and current user.
6. During logout:
    - Decode the refresh cookie if possible.
    - Clear the stored hash.
    - Clear the cookie regardless of token validity.
7. In the frontend, keep the access token in module/provider memory.
8. Restore sessions from the refresh endpoint rather than browser-cached user data.
9. Use one shared refresh promise in Axios to avoid multiple simultaneous refresh calls.

## 4. Safe User Responses

### Problem

Returning Sequelize user instances directly risks exposing `passwordHash`, `refreshTokenHash`, or future private fields.

### Solution

Added an explicit serializer that returns only:

- `id`
- `email`
- `username`
- `role`
- `createdAt`
- `updatedAt`

### Main files

- `backend/utils/user.utils.js`
- `backend/modules/auth/auth.controller.js`
- `backend/modules/users/users.controllers.js`
- `backend/test/user.utils.test.js`

### Reconstruction rule

Never return ORM entities directly from public API controllers. Convert them to an allowlisted response object first.

## 5. Consolidated Authentication Middleware

### What changed

- Kept `backend/middleware/verifyAuth.middleware.js` as the single authentication and role-authorization implementation.
- Removed:
    - `backend/modules/auth/auth.middleware.js`
    - `backend/modules/auth/role.middleware.js`
- Standardized Bearer-token parsing and response messages.

### Why

Multiple authentication implementations tend to drift in token format, error handling, and role behavior. One shared middleware path makes authorization easier to audit and test.

## 6. Environment and Database Configuration

### What changed

- Replaced the ignored runtime dependency on `backend/config/config.json` with JavaScript configuration.
- Added separate application and database environment parsers.
- Added development, test, and production Sequelize configurations.
- Added production secret validation.
- Added `.env.example` files for both applications.

### Main files

- `backend/config/config.js`
- `backend/config/env.js`
- `backend/models/index.js`
- `backend/.env.example`
- `frontend/.env.example`

### Why configuration was split

Sequelize CLI loads database configuration even for commands that do not start the web server. Keeping database parsing separate prevents CLI commands from unnecessarily requiring web-only settings such as JWT secrets and CORS origins.

### Reconstruction recipe

1. Load `.env` before reading configuration.
2. Validate and coerce database variables in one module.
3. Validate server, JWT, cookie, and CORS variables in another module.
4. Export `development`, `test`, and `production` objects from the Sequelize config file.
5. Import that same JavaScript config from `models/index.js`.
6. Require explicit secrets in production but allow safe local defaults for development and tests.
7. Commit `.env.example`; never commit `.env`.

## 7. Database Model, Migration, and Seed Alignment

### What changed

The `Users` table now enforces the same rules as the Sequelize model:

- Email is required and unique.
- Username is required and unique.
- Password hash is required.
- Role is required and defaults to `user`.
- Role is restricted to `admin`, `user`, or `guest`.
- Refresh-token hash is nullable.

The original create-user migration was corrected for clean installations. A follow-up migration was also added for databases that may already contain the old table.

### Main files

- `backend/models/user.js`
- `backend/migrations/20260511094324-create-user.js`
- `backend/migrations/20260928000000-harden-users.js`
- `backend/seeders/20260512000000-demo-users.js`

### Seed strategy

Seed execution was removed from automatic container startup. Seeding is now explicit and uses valid development-only accounts:

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| Admin | `admin@example.com` | `Admin123!` |
| Guest | `guest@example.com` | `Guest123!` |
| User  | `user@example.com`  | `User123!`  |

The seeder uses duplicate-safe insertion so repeated development runs do not create duplicate accounts.

### Reconstruction recipe

1. Define constraints in both the ORM model and database migration.
2. If a migration may already be deployed, add a new corrective migration rather than relying only on edits to the original file.
3. Add database-level role validation.
4. Use valid credentials that satisfy the same validators as the application.
5. Keep seed accounts development-only.
6. Run migrations automatically if desired, but run seeders explicitly.

## 8. API Security Hardening

### Added protections

- Strict CORS origin allowlist.
- Credentials-enabled CORS for refresh cookies.
- `100kb` JSON request limit.
- Helmet security headers.
- Rate limiting on authentication endpoints.
- Generic internal error responses.
- Email normalization.
- Password length limits.
- JWT issuer and audience checks.
- API health endpoint.
- Database connectivity check before the server starts listening.

### Main files

- `backend/src/app.js`
- `backend/src/server.js`
- `backend/config/env.js`
- `backend/middleware/rateLimit.middleware.js`
- `backend/middleware/error.middleware.js`
- `backend/modules/auth/validators/login.validator.js`
- `backend/modules/auth/validators/register.validator.js`

### Reconstruction recipe

1. Build CORS origins from an environment variable rather than accepting every origin.
2. Apply security headers before routes.
3. Limit request body sizes.
4. Rate-limit credential and refresh endpoints.
5. Normalize emails before database queries.
6. Avoid returning raw exception messages to clients.
7. Check database connectivity during process startup.
8. Add a simple health endpoint for containers and hosting platforms.

## 9. Portfolio Data Separation

### What changed

Moved portfolio content out of React presentation components into:

- `frontend/src/data/portfolio.js`

The data module now supplies:

- Professional experience.
- Education.
- Full project list.
- Selected-project flags.

The existing uncommitted “Who Cares Software” experience entry was preserved and included in the shared data.

### Updated consumers

- `frontend/src/pages/portfolio/subSections/ProfessionalExperience.jsx`
- `frontend/src/pages/portfolio/subSections/Education.jsx`
- `frontend/src/pages/portfolio/subSections/Projects.jsx`
- `frontend/src/pages/portfolio/subSections/SelectedProjects.jsx`

### Why

- Content can be edited without changing rendering logic.
- The selected-project and full-project views share one source of truth.
- Data can later be replaced with API or CMS content.
- Duplicate project definitions are eliminated.

### Reconstruction recipe

1. Define plain arrays for each content category.
2. Give each item stable identifiers or unique names.
3. Import the data into rendering components.
4. Keep view-specific state, such as `selected`, in the data model.
5. Map the data to reusable presentation components.

## 10. Frontend Correctness and Lint Cleanup

### What changed

- Resolved all existing frontend ESLint errors.
- Removed unused imports and variables.
- Fixed invalid hook usage in selected projects.
- Reworked table page clamping to avoid synchronous state updates inside effects.
- Added a backend ESLint configuration and root lint command.
- Disabled React PropTypes linting because this JavaScript project does not use the `prop-types` package and already relies on component conventions rather than runtime PropTypes.

### Main files

- `frontend/eslint.config.js`
- `frontend/src/components/table/FilterTable.jsx`
- `frontend/src/pages/portfolio/subSections/SelectedProjects.jsx`
- `backend/eslint.config.js`
- `package.json`

### Reconstruction recipe

1. Run lint before changing behavior to establish the baseline.
2. Fix hook-rule violations before cosmetic warnings.
3. Derive display values when possible instead of setting corrective state in effects.
4. Remove duplicate and unused modules.
5. Add one root command that lints every application.

## 11. Accessibility and Interaction Improvements

### What changed

- Added visible labels to login fields.
- Restored `type="email"` and added autocomplete attributes.
- Connected login errors to fields with accessible descriptions.
- Added `role="alert"` for authentication errors.
- Replaced clickable `<div>` elements with buttons or links.
- Added accessible names to icon-only buttons.
- Added keyboard focus styles.
- Made navbar dropdowns work with `:focus-within` as well as hover.
- Added reduced-motion support.
- Added semantic headings to system pages.
- Opened external links with `noopener,noreferrer`.
- Added a meaningful document title and description.

### Main files

- `frontend/src/pages/login/Login.jsx`
- `frontend/src/pages/login/Login.module.css`
- `frontend/src/layouts/public/PublicLayout.jsx`
- `frontend/src/components/navbar/Navbar.module.css`
- `frontend/src/index.css`
- `frontend/src/utils/utils.js`
- `frontend/index.html`
- `frontend/src/pages/system/*.jsx`

### Reconstruction checklist

- Use a native button for actions and an anchor for navigation.
- Give every form field a label.
- Give every icon-only control an accessible name.
- Ensure menus can open with keyboard focus.
- Provide visible focus indicators.
- Respect `prefers-reduced-motion`.
- Mark dynamic errors with an appropriate live-region role.

## 12. Docker Reliability

### What changed

- Dockerfiles use `npm ci` for lockfile-based installations.
- PostgreSQL has a readiness health check.
- Backend startup waits for a healthy database.
- Backend exposes an API health check.
- Frontend startup waits for a healthy backend.
- Backend startup runs migrations but not seeders.
- Development environment variables include the subdomain and cookie configuration.

### Main files

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`
- `backend/src/app.js`
- `backend/src/server.js`

### Reconstruction recipe

1. Use lockfiles and `npm ci` inside images.
2. Add `pg_isready` as the PostgreSQL health check.
3. Use `depends_on.condition: service_healthy` for the backend.
4. Add an HTTP health check for the backend.
5. Make the frontend depend on backend health.
6. Run migrations before backend startup.
7. Keep seed execution as a separate development command.

### Limitation

Docker Compose could not be executed in the development environment used for this change because Docker was not enabled in WSL. The Compose file was statically reviewed, formatted, and aligned with the application health endpoint, but a live container run remains a recommended verification step.

## 13. Root Developer Commands

### What changed

Added a root `package.json` and lockfile so common tasks can be run from the repository root.

Available commands:

```bash
npm run dev
npm run build
npm run lint
npm test
npm run format
npm run db:migrate
npm run db:seed
```

`npm run dev` uses `concurrently` to start the backend and frontend together.

### Main files

- `package.json`
- `package-lock.json`
- `backend/package.json`

### Reconstruction recipe

1. Add one root script for each common repository task.
2. Delegate application-specific work with `npm --prefix`.
3. Use `concurrently` only for local development orchestration.
4. Keep database commands delegated to the backend package.

## 14. Automated Tests

### What changed

Added backend tests using Node's built-in test runner, avoiding another test-framework dependency.

Current coverage includes:

- Access-token claims and validation.
- Refresh-token claims.
- Login email normalization.
- Registration password validation.
- Safe user serialization.
- Root and role subdomain detection.
- Application-header detection.
- Unknown application rejection.
- Application role access.
- Bearer-token authentication.
- Missing credentials.
- Role authorization.

### Test files

- `backend/test/auth.utils.test.js`
- `backend/test/auth.validators.test.js`
- `backend/test/user.utils.test.js`
- `backend/test/subdomain.middleware.test.js`
- `backend/test/appAccess.middleware.test.js`
- `backend/test/verifyAuth.middleware.test.js`

### Reconstruction recipe

1. Start with pure utilities and middleware that do not require a database.
2. Verify token claims and rejection behavior.
3. Test that private fields cannot appear in serialized users.
4. Test hostname and application resolution independently.
5. Test role middleware with mocked requests and responses.
6. Add database-backed API integration tests as a later layer.

## 15. Dependency Security Updates

### What changed

- Applied non-breaking npm audit fixes to frontend and backend lockfiles.
- Frontend production dependencies report zero known vulnerabilities.
- Backend high-severity issues were removed.

### Remaining limitation

The backend audit reports two moderate transitive advisories related to Sequelize's `uuid` dependency. npm's automated forced fix proposes downgrading to Sequelize 3, which would be a breaking regression. That forced change was intentionally not applied.

### Rule for reconstruction

Run non-breaking audit fixes, then review remaining advisories manually. Do not accept an automated major downgrade merely to produce a zero-vulnerability report.

## 16. Documentation and Repository Hygiene

### What changed

- Added the root project README.
- Added this reconstruction-oriented change log.
- Added backend and frontend environment examples.
- Updated `.gitignore` so example environment files can be committed.
- Updated `.prettierignore` to ignore the obsolete local Sequelize JSON configuration.
- Updated package lockfiles after dependency security fixes.

### Main files

- `README.md`
- `CHANGELOG.md`
- `.gitignore`
- `.prettierignore`
- `backend/.env.example`
- `frontend/.env.example`

## Verification Performed

The completed change set was validated with:

```bash
npm test
npm run lint
npm run build
./backend/node_modules/.bin/prettier --check \
  README.md CHANGELOG.md package.json docker-compose.yml \
  backend/config backend/eslint.config.js backend/middleware \
  backend/migrations backend/models backend/modules backend/package.json \
  backend/seeders backend/src backend/test backend/utils \
  frontend/src frontend/vite.config.js frontend/index.html \
  --ignore-path .prettierignore
git diff --check
```

Results at completion:

- 15 backend tests passing.
- Backend ESLint passing.
- Frontend ESLint passing.
- Frontend production build passing.
- Prettier check passing.
- JavaScript syntax checks passing.
- Git whitespace check passing.
- Frontend production dependency audit: zero known vulnerabilities.
- Backend production dependency audit: no high-severity findings; two moderate Sequelize transitive findings remain.

## Files Removed

The following duplicate middleware files were removed after their behavior was consolidated:

- `backend/modules/auth/auth.middleware.js`
- `backend/modules/auth/role.middleware.js`

## Intentionally Deferred

- GitHub Actions or other continuous integration configuration.
- Database-backed authentication integration tests.
- Frontend component and browser tests.
- Production Docker image optimization and static frontend serving.
- Full admin, guest, and user application features.
- Public application menu.
- Blog and admin-managed content system.

## Quick Reconstruction Order

When recreating this platform from a blank React, Express, and PostgreSQL repository, use this order:

1. Create frontend and backend packages.
2. Add validated environment and Sequelize configuration.
3. Create the user model, migrations, and development seeder.
4. Implement password hashing and safe user serialization.
5. Implement access and refresh JWT generation.
6. Implement login, refresh rotation, logout, and `/users/me`.
7. Add authentication and role middleware.
8. Add security middleware, CORS, rate limiting, and health checks.
9. Add hostname/application detection and backend application access rules.
10. Add frontend application URL helpers and hostname-selected route groups.
11. Add public, user, guest, and admin layouts.
12. Add the in-memory access-token provider and Axios refresh interceptor.
13. Add accessible login and system pages.
14. Move portfolio content to a shared data module.
15. Add Docker health dependencies and migration startup.
16. Add root scripts, linting, formatting, and tests.
17. Run the complete verification command set.

Following this order avoids building role applications on top of an unstable authentication or database foundation.
