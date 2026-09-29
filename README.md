# Full-Stack Portfolio Platform

A full-stack JavaScript project that combines a public portfolio/CV website with a secure, subdomain-based application platform. The repository includes a React frontend, an Express API, PostgreSQL persistence, rotating JWT sessions, role-aware applications, a lightweight animated CSS background, reusable UI components, automated backend tests, and a Docker-based development setup.

For a dated record of implementation decisions and step-by-step reconstruction guidance, see [CHANGELOG.md](./CHANGELOG.md).

## Today's High-Level Update — September 28, 2026

Today's work turned the original portfolio and authentication prototype into a more complete platform foundation. The changes covered architecture, security, database consistency, developer tooling, accessibility, and the site's visual system.

### Platform and subdomain architecture

- Kept one shared React/Vite frontend while selecting the active application from the browser hostname.
- Added separate public, user, guest, and admin route groups, layouts, and navigation.
- Added a dedicated user application alongside the existing public, guest, and admin areas.
- Added frontend helpers for building and navigating between application URLs.
- Added an `X-App-Name` API header so the backend can identify requests made through the shared API hostname.
- Added backend application-resolution and access middleware to enforce which roles may use each subdomain.

| Development host    | Application                | Access          |
| ------------------- | -------------------------- | --------------- |
| `lvh.me:5173`       | Public portfolio and login | Public          |
| `user.lvh.me:5173`  | User workspace             | User and admin  |
| `guest.lvh.me:5173` | Guest workspace            | Guest and admin |
| `admin.lvh.me:5173` | Administration workspace   | Admin           |

### Authentication and API security

- Rebuilt the access-token and refresh-token lifecycle so expired access tokens can be refreshed correctly.
- Kept access tokens in frontend memory instead of trusting authentication data from `localStorage`.
- Stored refresh tokens in HTTP-only cookies and only stored their bcrypt hashes in the database.
- Added refresh-token rotation and session restoration when the frontend starts.
- Added Axios request retry after a successful token refresh.
- Made logout clear both the refresh cookie and stored refresh-token hash without requiring a valid access token.
- Added safe user serialization so password and refresh-token hashes cannot be returned by API responses.
- Consolidated duplicate authentication and role middleware.
- Added issuer and audience validation to JWT handling.
- Added CORS allow-listing, Helmet, request-size limits, authentication rate limiting, and a health endpoint.
- Added centralized environment validation with production checks for required secrets.

### Database and seed-data hardening

- Aligned the Sequelize user model, migrations, and database constraints.
- Added a `refreshTokenHash` column and enforced required user fields.
- Added unique email and username constraints.
- Added a database role constraint covering `admin`, `user`, and `guest`.
- Updated seed data to be repeatable and to provide development users for each role.
- Unified Sequelize runtime and CLI configuration.

### Portfolio and frontend quality

- Moved portfolio content into shared data modules instead of embedding it directly in presentation components.
- Improved route guards, login behavior, system pages, navigation, and accessibility labels.
- Fixed existing frontend lint issues and improved reusable table and layout behavior.
- Added persistent day and night themes with system preference as the initial default.

### Background system

- Added one full-site background layer behind every route and layout.
- The layer renders a CSS-only matrix rain effect with Japanese characters, letters, and digits.
- Forty lightweight columns use varied negative delays and durations so the rain begins fully populated.
- The matrix colors use the site's teal, terracotta, peach, and charcoal palette.
- No canvas, SVG animation loop, or WebGL processing is required.

The complete background implementation is located under:

```text
frontend/src/components/background/
```

### Development workflow and reliability

- Added root commands for starting, building, linting, testing, formatting, migrating, and seeding the project.
- Added backend ESLint and Node test-runner configuration.
- Added automated coverage for token utilities, validators, safe serialization, authentication middleware, subdomain detection, and application access.
- Added environment example files for the backend and frontend.
- Improved Docker startup ordering with database and API health checks.
- Configured the backend container to apply migrations before starting.
- Updated dependencies and lockfiles, and reviewed remaining dependency advisories.
- Added the detailed reconstruction-oriented [CHANGELOG.md](./CHANGELOG.md).

### Validation performed

The overall platform work was validated with backend tests, backend and frontend linting, a frontend production build, formatting checks, syntax checks, and Git whitespace checks. The final background-system update specifically passed:

```bash
cd frontend
npm run lint
npm run build
npx prettier --check src/App.jsx src/components/background src/index.css

cd ..
git diff --check
```

The backend test suite currently contains 15 passing tests. A live Docker Compose run remains recommended because Docker was not available in the environment used for the platform-foundation validation.

## What Has Been Built

### Public portfolio

- A responsive portfolio/CV landing page covering professional experience, education, and selected projects.
- A dedicated projects page with technology-tag filtering and pagination.
- Reusable portfolio components for split sections, cards, navigation, and page layouts.
- Public links for GitHub, LinkedIn, and email contact.
- Persistent day and night themes.
- One shared animated CSS matrix background behind every application route.
- Shared system pages for forbidden, unauthorized, unavailable, and unknown routes.

### Authentication and authorization

- User registration, login, token refresh, and logout API endpoints.
- Password hashing with `bcrypt`.
- Short-lived JWT access tokens and longer-lived refresh tokens.
- Refresh tokens stored in HTTP-only cookies.
- Frontend sessions restored from the refresh-token cookie and verified against the API.
- An Axios interceptor for access-token refresh and request retry when an API request returns `401`.
- Role-aware frontend applications and layouts for `admin`, `guest`, and `user` accounts.
- Backend middleware for authenticated requests and role checks.
- A protected current-user endpoint.

### Backend foundation

- Express 5 API organized into routes, controllers, services, validators, and middleware.
- PostgreSQL access through Sequelize.
- A user model, database migration, and development seed data for the available roles.
- Request validation with Zod.
- Shared success and error response helpers.
- Security and development middleware including Helmet, CORS, cookie parsing, and Morgan logging.
- Hostname-based application routing for the public, user, guest, and admin areas.
- Validated environment configuration, authentication rate limiting, and application-aware access enforcement.

### Development environment

- Separate frontend and backend Node applications.
- Dockerfiles for both applications.
- Docker Compose services for PostgreSQL, the API, and the Vite development server.
- Backend hot reloading with Nodemon and frontend hot module replacement with Vite.
- Shared Prettier formatting rules and frontend ESLint configuration.
- Root development commands and automated backend security-focused tests.

## How It Works

```text
Browser
  |
  v
React + Vite frontend (port 5173)
  |
  | Axios requests to /api
  v
Express API (port 5000)
  |
  | Sequelize
  v
PostgreSQL (port 5432)
```

The frontend is divided into public, user, guest, and admin route groups. `AuthProvider` owns the current user and in-memory access token, while route guards decide which protected pages can be rendered. Each role has its own layout and navigation options. The active route and subdomain also select a coordinated background, palette, and appearance configuration.

On login, the API verifies the stored password hash and returns an access token plus basic user information. It also sets a refresh token in an HTTP-only cookie. Axios attaches the access token to API requests and attempts a refresh when the token expires.

The backend follows a modular flow:

```text
Route -> middleware/validation -> controller -> service -> Sequelize model -> PostgreSQL
```

## Main Technologies

| Area     | Technologies                                                  |
| -------- | ------------------------------------------------------------- |
| Frontend | React 19, React Router, Vite, Axios, CSS Modules, React Icons |
| Backend  | Node.js, Express 5, JWT, bcrypt, Zod                          |
| Database | PostgreSQL 17, Sequelize 6, Sequelize CLI                     |
| Tooling  | Docker Compose, Nodemon, ESLint, Prettier                     |

## Repository Structure

```text
fullstack/
├── backend/
│   ├── config/        # Database and application-area configuration
│   ├── middleware/    # Authentication, access, subdomain, and error middleware
│   ├── migrations/    # Sequelize database migrations
│   ├── models/        # Sequelize models
│   ├── modules/       # Feature modules, currently authentication and users
│   ├── seeders/       # Development seed data
│   ├── src/           # Express app and server entry points
│   └── utils/         # Shared API response and constant helpers
├── frontend/
│   ├── public/        # Static assets
│   └── src/
│       ├── api/       # Axios client and token refresh handling
│       ├── auth/      # Authentication context
│       ├── components/# Reusable UI and background components
│       ├── config/    # Subdomain URL and appearance configuration
│       ├── context/   # Theme and background-preference contexts
│       ├── layouts/   # Public, user, guest, and admin layouts
│       ├── pages/     # Portfolio, login, role landing, and system pages
│       └── routes/    # Public and role-protected route definitions
└── docker-compose.yml
```

## Running the Project

### Docker Compose

The intended development setup starts all three services together:

```bash
docker compose up --build
```

Once running:

- Frontend: `http://lvh.me:5173`
- Backend API: `http://lvh.me:5000/api`
- PostgreSQL: `localhost:5432`

The backend container runs database migrations before starting. Development seed data is an explicit step:

```bash
docker compose exec backend npm run db:seed
```

Seeded development accounts are:

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| Admin | `admin@example.com` | `Admin123!` |
| Guest | `guest@example.com` | `Guest123!` |
| User  | `user@example.com`  | `User123!`  |

### Running services manually

Requirements:

- Node.js 22 or a compatible current Node.js release
- npm
- PostgreSQL

You can also install the root development helper and run both Node applications together:

```bash
npm install
npm run dev
```

Install dependencies:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Copy `backend/.env.example` to `backend/.env` and replace the development secrets:

```env
PORT=5000
JWT_ACCESS_SECRET=replace-with-a-secret
JWT_REFRESH_SECRET=replace-with-a-different-secret
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=app_db
DB_PORT=5432
COOKIE_DOMAIN=.lvh.me
CORS_ORIGINS=http://lvh.me:5173,http://user.lvh.me:5173,http://guest.lvh.me:5173,http://admin.lvh.me:5173
APP_ROOT_DOMAIN=lvh.me
```

Copy `frontend/.env.example` to `frontend/.env`. The development defaults are:

```env
VITE_API_URL=http://lvh.me:5000/api
VITE_APP_ROOT_DOMAIN=lvh.me
VITE_APP_MAIN_URL=http://lvh.me:5173
VITE_APP_USER_URL=http://user.lvh.me:5173
VITE_APP_GUEST_URL=http://guest.lvh.me:5173
VITE_APP_ADMIN_URL=http://admin.lvh.me:5173
```

Development hosts map to the applications as follows:

- `http://lvh.me:5173` — portfolio and login
- `http://user.lvh.me:5173` — user application
- `http://guest.lvh.me:5173` — guest application
- `http://admin.lvh.me:5173` — admin application

Start each application in a separate terminal:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## API Overview

| Method | Endpoint             | Purpose                           |
| ------ | -------------------- | --------------------------------- |
| `POST` | `/api/auth/register` | Create a user                     |
| `POST` | `/api/auth/login`    | Authenticate and create a session |
| `POST` | `/api/auth/refresh`  | Issue a new access token          |
| `POST` | `/api/auth/logout`   | Clear the refresh-token cookie    |
| `GET`  | `/api/users/me`      | Return the authenticated user     |

## Current Status

The core learning-platform foundation is in place: the portfolio is usable, the frontend and backend authentication flows have been implemented, role-based pages are available, and the project is structured to run as separate services or through Docker Compose.

The repository is still under active development. Current limitations include:

- Admin, guest, and user areas are currently starter landing pages rather than complete applications.
- The planned public application menu and blog/CMS have not yet been implemented.
- The current automated test suite covers security-critical utilities and validators; full database-backed API and browser tests are still needed.
- Role applications are intentionally starter dashboards rather than complete products.

## Planned Work

- Add a menu of public web applications.
- Build a blog where administrators can create and edit posts and visitors can read the latest content.
- Expand the role-specific application areas.
- Expand automated coverage with database-backed API and frontend interaction tests.
- Continue refining the portfolio and project-table UI.
# Production deployment

For automatic deployment from `main` to an Ubuntu server on Hetzner, see
[the deployment setup guide](deploy/README.md).
