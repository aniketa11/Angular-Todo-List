# Task Management Angular App

This assignment was implemented as a compact Angular task manager with a single task state service and a JSON-server mock API.

## Setup

1. Install dependencies:
   npm install
2. Start the mock API:
   npx json-server --watch db.json --port 3000
3. Run the Angular app:
   npm start
4. Run tests:
   npm test -- --watch=false --browsers=ChromeHeadless

## Architecture

- TaskStoreService is the single source of truth for task state.
- TaskApiService is the only place that calls the HTTP API.
- Components read from the store via observables and never call HttpClient directly.
- Derived statistics are computed from the current task array inside the store to keep UI logic simple.

## Why this state-management approach

A small BehaviorSubject-based service is enough for this time-limited assignment. It keeps the app simple, clear, and strongly typed while still showing a real single-source-of-truth pattern with immutable state replacement.

## How data passes through the layers

1. UI actions such as list load, create, edit, and delete interact with TaskStoreService.
2. The store forwards requests to TaskApiService.
3. The API layer returns typed Task objects.
4. The store updates its observable state and derived summary, and the components render that state.

## Trade-offs made

- The app uses a simple mock JSON server rather than a full backend.
- Routing is lightweight and route-based rather than lazy-loaded.
- The UI is intentionally simple and focused on the working requirements rather than visual polish.

## What to improve before production

- Add route guards and loading skeletons.
- Switch to a more scalable state solution for larger datasets.
- Improve accessibility and mobile layout ergonomics.
- Add backend validation and authentication if this was a real product.

## Supporting thousands of tasks efficiently

- Add pagination and server-side filtering.
- Use a proper backend query API with indexes.
- Introduce virtual scrolling for large task tables.

## Completed requirements

- Task list with search, status filter, priority filter, overdue indicator, and empty state
- Reusable reactive task form for create and edit
- Delete confirmation before removal
- Dashboard summary counters
- Routing for /tasks, /tasks/new, /tasks/:id/edit, and not-found
- JSON-server mock data source
- Loading and error handling
- Automated tests for service, form validation, API error handling, and component creation
- Lazy-loaded task feature module for route-level code splitting
- Pagination for filtered task results
- Responsive mobile-friendly layout adjustments for smaller screens
- Lightweight drag-and-drop status interaction on the list row

## AI / tooling declaration

This submission was built directly in the Angular workspace. GitHub Copilot / Codex-style coding assistance was used to help structure, refine, and validate the implementation, but the application logic, UI behavior, and final code were authored and reviewed in the workspace itself.

