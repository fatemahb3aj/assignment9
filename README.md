# Reading List App

Full-stack Reading List application built with Node.js/Express and React/Vite.

## Project Structure

- `server/` — Express REST API (`/api/books`, `/api/stats`) with validation and book store logic
- `client/` — React + Vite frontend UI

## Setup & Run

### 1. Backend

```bash
cd server
npm install
npm run dev

## Challenges Faced

-Rebuilding the frontend from scratch after missing dependencies: Running into ENOENT errors because package.json wasnt there meant wiping out the half built client folder and starting fresh with Vite and React. Recreating the API client, form, stats panel, and main page piece by piece while keeping everything clean and connected took extra care.


-Getting environment variables and two servers to play nice: Setting up client\.env with VITE_API_URL in the right spot and remembering to restart the Vite dev server afterward was essential so the frontend could talk to the Express API on http://localhost:3000 without broken requests or connection mismatches.


-Keeping UI state, filtering, and backend calls aligned: Wiring up GET, POST, PUT, PATCH, and DELETE actions together meant making sure search queries, genre and read status filters, sorting, and live stats all stayed in sync after every change.


-Handling rules and edge cases cleanly: Making sure ratings only apply to books marked as read, clearing a rating if a book gets switched back to unread, resetting edit state when needed and surfacing clear error messages without overcomplicating the code required careful attention to detail.


-Working in the right terminal paths and avoiding lock hiccups: Running commands in Windows PowerShell while juggling multiple terminals and folders made path mistakes easy (`cd ..` landing a level too high or deleting a folder while files were open), so double checking the active directory before running commands saved a lot of friction.