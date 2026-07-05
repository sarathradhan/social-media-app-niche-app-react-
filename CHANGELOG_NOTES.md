# Project Change Notes

This document summarizes the improvements that have already been applied to the app and the next areas that are still worth addressing.

## What has been improved already

### Authentication and access control
- Added route protection so protected pages redirect unauthenticated users to login.
- Preserved the user’s intended destination after login using a redirect parameter.
- Prevented authenticated users from visiting the login and signup pages unnecessarily.
- Standardized authentication-related API responses and error handling.

### User experience and forms
- Improved login and signup forms with trimmed input values, inline validation, and loading-state protection.
- Improved the post creation form with caption validation, upload validation, progress feedback, and duplicate-submission protection.
- Replaced browser confirm dialogs with in-app confirmation UI where appropriate.
- Added consistent toast notifications for success and error feedback.

### Loading and empty states
- Added loading, error, and empty-state components across feed, explore, liked posts, my posts, and profile views.
- Added retry handling for content-loading failures.

### File uploads
- Added client-side image validation for posts and profile avatars.
- Added server-side upload validation to reject unsupported files and oversized images.
- Enforced a 5 MB upload limit for images.

### API consistency
- Centralized frontend API request behavior and error message extraction.
- Standardized backend JSON success/error responses so the client receives predictable payloads.

## Feature implemented: comments system

### Implementation plan
- Add a comments table to the existing PostgreSQL schema so each post can have multiple user comments.
- Expose REST endpoints for listing, creating, and deleting comments while preserving the current route and controller structure.
- Render a comment section under each post with a comment input, validation, loading state, empty state, and delete control for the comment owner.

### Affected files
- [Project/server/db.js](Project/server/db.js) and [Project/README.md](Project/README.md) for schema documentation
- [Project/server/routes/postsRoutes.js](Project/server/routes/postsRoutes.js)
- [Project/server/controllers/postsController.js](Project/server/controllers/postsController.js)
- [Project/client/src/CommentSection.jsx](Project/client/src/CommentSection.jsx)
- [Project/client/src/Feed.jsx](Project/client/src/Feed.jsx)

### Database updates
- Added a new comments table with a foreign key to posts and users.
- Added an index on post_id and created_at to support efficient comment listing.
## Feature implemented: user search

### Implementation plan
- Add a protected search endpoint at `/api/profile/search` that matches usernames using a safe `ILIKE` pattern.
- Add a debounced search bar on the Explore page to query users as the user types.
- Preserve follow/unfollow actions on search results and show a helpful empty state when no users match.

### Affected files
- [Project/server/routes/profileRoutes.js](Project/server/routes/profileRoutes.js)
- [Project/server/controllers/profileController.js](Project/server/controllers/profileController.js)
- [Project/client/src/Explore.jsx](Project/client/src/Explore.jsx)
- [Project/client/src/SearchBar.jsx](Project/client/src/SearchBar.jsx)
- [Project/client/src/useDebouncedValue.js](Project/client/src/useDebouncedValue.js)

### Technical details
- Search results exclude the current user and return up to 15 matches.
- Search is debounced to reduce request volume while typing.
- The Explore page falls back to full suggestions when the query is empty.
- Protected endpoint returns 401 for unauthenticated requests, matching existing profile route security.

## Visual overhaul: responsive design and dark mode

### Implementation summary
- Added a modern responsive layout and CSS theme variables with dark mode support.
- Introduced smoother card and image animations, improved spacing and mobile-friendly grid layouts.
- Added a theme toggle in the sidebar that persists the user's choice.

### Affected files
- [client/src/styles/sty.css](client/src/styles/sty.css) — theme variables, responsive rules, animations
- [client/src/Sidebar.jsx](client/src/Sidebar.jsx) — theme toggle UI
- [client/src/App.jsx](client/src/App.jsx) — mobile bottom navigation

### Notes
- Dark theme is enabled by toggling the theme switch; the preference is stored in `localStorage`.
- Layout adapts to single-column mobile, two-column tablet, and centered desktop rails.

### Database updates
- No database schema changes required for search.
### Technical details
- Comments are loaded newest-first from the database.
- Empty comments are blocked on both the client and server.
- Comment length is capped at 280 characters.
- Only the comment owner can delete their own comment.
- The UI updates immediately after a successful add/delete without a full page refresh.

## Planned future improvements

### UX polish
- Add richer empty states with illustrations and clearer call-to-action guidance.
- Improve mobile responsiveness in a few remaining screens.
- Add small interaction refinements such as better loading skeletons and smoother transitions.

### Reliability and maintenance
- Add automated tests for authentication, post creation, follow/unfollow flows, and profile updates.
- Add backend validation for more edge cases and malformed request payloads.
- Improve error logging and monitoring for production debugging.

### Feature expansion
- Add moderation features for posts and profiles.
- Add richer profile customization and settings management.
- Expand feed recommendations and search/filter options.

## Notes for future contributors
- The app now uses a more consistent pattern for loading, error, and empty states.
- Authentication and upload behavior have been centralized around shared helpers where possible.
- If you change a page or API flow, keep the same patterns for validation, toast feedback, and user-friendly errors.
