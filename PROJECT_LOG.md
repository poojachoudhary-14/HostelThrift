# HostelThrift — Project Log & Learning Notes

A running record of what the project is, what's been built, decisions made,
and what's coming next. Keep updating this as you go — it doubles as
documentation for your GitHub repo and a way to track your own learning.

---

## 1. What This Project Is

A hyperlocal, peer-to-peer thrift marketplace for college hostel residents
to buy, sell, and bargain on second-hand clothes, bags, and essentials —
with zero shipping fees, since everyone lives in the same hostel.

**Why it's a good project:**
- Real, narrow use case with a built-in test audience (your hostel)
- Good scope to demonstrate full-stack skills (auth, database, CRUD, chat)
- Can actually launch and be used, not just a portfolio demo

---

## 2. Tech Stack (Decided & Why)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS | One repo for frontend + backend logic, fast styling, modern and resume-friendly |
| Backend/Database | Firebase (Firestore) | Free tier is generous, no separate backend server needed, fast to set up |
| Auth | Firebase Authentication (Email/Password) | Built-in, easy to restrict to college email domain |
| Image Storage | Firebase Storage | Same ecosystem as Auth/DB, simple SDK |
| Deployment (planned) | Vercel | Free, integrates natively with Next.js |
| Version Control | Git + GitHub | Industry standard, portfolio visibility |

**Note:** Originally considered Supabase (Postgres) — switched to Firebase
partway through. Both are valid choices; Firebase was chosen for faster
setup and simpler real-time-friendly SDKs.

---

## 3. Scope Decisions (v1 vs later)

The original feature list (written by hand) was closer to a v3/v4 product —
comprehensive but too much to build before ever launching. Key scoping
decisions made:

**Cut from v1, deferred to later:**
- ID card upload + admin verification queue (college email domain is
  trust-enough for v1)
- Structured "offer" system with Accept/Reject/Counter buttons (a plain
  text message with a number *is* the offer, for now)
- Real-time chat via WebSockets (using simple polling instead — refetch
  messages every ~10 seconds. Much simpler infra, good enough for hostel
  use where instant delivery isn't expected)
- Wishlist, purchase history, earnings tracker, analytics dashboard
- Admin panel UI (you, the dev, do moderation manually for now)

**v1 core loop:**
1. Sign up with college email (`@cujammu.ac.in` only)
2. Post an item (title, category, condition, price, photos, hostel, room)
3. Browse/search/filter items
4. Message the seller (in-app, simple threaded chat, not real-time)
5. Seller marks item Available / Reserved / Sold
6. Manual admin moderation (you, directly)

**Reasoning:** Distribution (getting real listings + users) matters more
than features early on. A working, simple v1 in ~4-5 weeks beats a
feature-complete app that never ships.

---

## 4. Database Schema (Firestore)

Firestore is a NoSQL document database — data is organized into
**collections** (like tables) containing **documents** (like rows), each
holding fields.

### `users` collection
Each document = one user, keyed by their Firebase Auth UID.
```
name          (string)
email         (string, must match @cujammu.ac.in)
hostelBlock   (string — display label changed to "Hostel Name", e.g. "SBGH")
roomNumber    (string)
createdAt     (string, ISO date)
```

### `items` collection (planned, not built yet)
```
sellerId      (string, references users doc ID)
title         (string)
description   (string)
category      (string: ethnic_wear | western_wear | bags_shoes | electronics | books_equipment | other)
condition     (string: brand_new | like_new | gently_used | well_loved)
size          (string, optional)
price         (number)
status        (string: available | reserved | sold)
imageUrls     (array of strings, from Firebase Storage)
createdAt     (string, ISO date)
```

### `conversations` collection (planned)
```
itemId        (string, references items doc)
buyerId       (string, references users doc)
sellerId      (string, references users doc)
createdAt     (string, ISO date)
```

### `messages` subcollection (planned, nested under each conversation)
```
senderId      (string)
text          (string)
createdAt     (string, ISO date)
```

---

## 5. What's Been Built So Far

### ✅ Project setup
- GitHub repo `HostelThrift` created (private)
- Next.js app scaffolded with TypeScript, Tailwind CSS, App Router, ESLint
- `.gitignore` configured to exclude `node_modules/`, `.next/`, `.env.local`
- Git history cleaned once (an early mistake committed `node_modules` — fixed
  by resetting git history and force-pushing a clean version)

### ✅ Firebase setup
- Firebase project `hostel-thrift` created (Spark/free plan)
- Web app registered inside the Firebase project
- **Authentication** enabled with Email/Password sign-in method
- **Firestore Database** created (Standard edition, test mode security rules)
- **Storage** bucket created (for future image uploads)
- Firebase SDK installed via `npm install firebase`
- Config keys stored safely in `.env.local` (never committed to git —
  verified with `git log --all --full-history -- .env.local` returning empty)
- `src/lib/firebase.ts` created to initialize Firebase once and export
  `auth`, `db`, `storage` for use across the app

### ✅ Signup page (`src/app/(auth)/signup/page.tsx`)
- Form fields: Name, College Email, Password, Hostel Name, Room Number
- Validates email ends with `@cujammu.ac.in` before allowing signup
- On submit: creates a Firebase Auth user (`createUserWithEmailAndPassword`),
  then saves the extra profile fields into a `users` Firestore document
  keyed by the new user's UID
- Tested end-to-end: confirmed user appears in Firebase Auth → Users tab,
  and matching profile document appears in Firestore → `users` collection

### ✅ Login page (`src/app/(auth)/login/page.tsx`)
- Fields: College Email, Password
- Uses `signInWithEmailAndPassword`; shows a friendly "Incorrect email or
  password" message instead of raw Firebase error codes
- Link to Signup for new users
- Tested with both wrong and correct credentials

### ✅ Auth Context (`src/context/AuthContext.tsx`)
- Wraps the whole app via `AuthProvider` in `src/app/layout.tsx`
- Uses Firebase's `onAuthStateChanged` listener so login state is tracked
  globally — any component can call `useAuth()` to get
  `{ user, profile, loading }`
- Also fetches the user's Firestore profile doc (name, hostel, room)
  automatically whenever they're logged in

### ✅ Navbar (`src/components/Navbar.tsx`)
- Logged in: Home / Sell / Chats / [Name] / Logout
- Logged out: Log In / Sign Up
- Logout calls Firebase `signOut()` and redirects to `/login`
- Rendered globally in `src/app/layout.tsx`, above `{children}`

### ✅ Sell page (`src/app/sell/page.tsx`)
- Fields: Title, Description, Category (dropdown), Condition (dropdown),
  Price, up to 4 photos
- On submit: uploads each photo to **Cloudinary** (switched off Firebase
  Storage — see Decision Log below), then saves the item to Firestore's
  `items` collection with the resulting image URLs
- Blocks submission if the user isn't logged in

### ✅ Homepage / Browse feed (`src/app/page.tsx`)
- Fetches all documents from `items`, ordered by `createdAt` descending
- Displays as a responsive grid: image, title, price, hostel block, status
- Each card links to `/item/[id]` (detail page not built yet — currently 404s)
- Shows a logged-out landing message with a Log In link if not authenticated

---

## 6. Decision Log

**Switched image storage from Firebase Storage → Cloudinary.**
Firebase changed its policy so Cloud Storage now requires the paid Blaze
plan (needs a credit card on file), even for free-tier usage amounts. To
keep the project fully free with no card required, switched to Cloudinary:
- Free account, no card needed
- Uploads go directly from the browser via an **unsigned upload preset**
  (`hostelthrift_unsigned`) — safe because it never exposes the API secret
- Images organized into `hostelthrift/{userId}/` folders in Cloudinary
- Firebase Auth + Firestore are unaffected — only image storage moved

---

## 7. Bugs Hit & How They Were Fixed (good to remember!)

| Problem | Cause | Fix |
|---|---|---|
| `npm naming restrictions` error scaffolding Next.js | Folder name `HostelThrift` has capital letters; npm package names must be lowercase | Scaffolded in a temp lowercase folder, then moved files into the real repo folder, fixed `"name"` in `package.json` manually |
| Git asked for username/password on clone/push, password didn't work | GitHub removed password auth for git operations years ago | Created a GitHub **Personal Access Token** (Settings → Developer settings → Tokens classic) and used it *as* the password |
| `node_modules` got pushed to GitHub (huge repo size, GH001 warning) | `.gitignore` file didn't exist yet when first commit was made | Ran `git rm -r --cached node_modules`, created a proper `.gitignore`, then did a full history reset (`rm -rf .git`, reinit, force push) to fully remove it from history |
| `Module not found: Can't resolve '@/lib/firebase'` | `tsconfig.json` had a broken path alias: `"default@/*"` instead of `"@/*"` (leftover from a confusing CLI prompt during setup) | Manually corrected the key in `tsconfig.json` to `"@/*": ["./src/*"]` |
| `Firebase: Error (auth/configuration-not-found)` | Authentication hadn't been "started" yet in Firebase console when signup was first tried | Clicked "Get started" on the Authentication page in Firebase console to fully provision it, then retried |
| `Firebase: Error (auth/email-already-in-use)` | Not actually a bug — the account from the *previous* successful test already used that email | Used a new test email to confirm signup worked correctly |
| `children is not defined` runtime error in `layout.tsx` | A copy-paste left the file with a duplicated/broken `return` statement, so the function signature lost its `children` parameter | Rewrote `layout.tsx` cleanly from scratch |
| Sell form stuck on "Posting..." forever | Firebase Storage now requires the paid Blaze plan — image uploads silently 404'd (confirmed via browser console: "Preflight response... Status code: 404") | Switched image uploads to Cloudinary instead |
| Uploaded image appeared mixed in with Cloudinary's sample images | No folder was specified in the upload request | Added `formData.append("folder", ...)` to organize uploads per-user |
| Homepage showed old test content instead of the new item grid | Dev server / browser served stale content after a large file replace | Hard-restarted `npm run dev` and hard-refreshed the browser |

**Lesson:** most of these were environment/setup/caching issues, not logic
bugs — completely normal for a first real project. When something looks
broken but the code looks correct, try in order: hard refresh browser →
restart dev server → check browser console for the actual error.

---

## 8. What's Next

In order:
1. **Item detail page** (`/item/[id]`) — full photos, description, seller
   info, "Message Seller" button
2. **Simple chat (polling-based)** — conversations + messages collections,
   refetch every ~10 seconds
3. **Seller dashboard** — manage own listings, toggle Available/Reserved/Sold
4. **Search & filters** on the homepage (category, price, size)
5. **Deploy to Vercel** — get it live on a real URL

---

## 9. Useful Commands Reference

```bash
# Navigate to project
cd HostelThrift

# Start local dev server
npm run dev
# then open http://localhost:3000

# Stop dev server
Ctrl + C

# Check what's changed
git status

# Save + upload changes to GitHub
git add .
git commit -m "Describe what changed"
git push origin main

# Open a file in a text editor from terminal
open -a TextEdit path/to/file
```

---

## 10. Key Concepts Learned So Far

- **Git vs GitHub**: Git is the version control tool running on your
  computer; GitHub is where that history gets backed up/hosted online.
- **`.gitignore`**: tells git which files/folders to never track (like
  `node_modules/`, which is huge and regenerable, or `.env.local`, which
  has secret keys).
- **Environment variables (`.env.local`)**: a way to keep config values
  (like API keys) out of your actual code and out of git, injected at
  runtime instead.
- **Path aliases (`@/*`)**: a shortcut so imports can say `@/lib/firebase`
  instead of long relative paths like `../../lib/firebase`. Configured in
  `tsconfig.json`.
- **Firebase Auth vs Firestore**: two separate services — Auth handles
  login/signup/passwords; Firestore is just a database. Creating a user in
  Auth does *not* automatically create any data in Firestore — you have to
  explicitly write that data yourself (which is what the signup form does).
- **Personal Access Tokens**: GitHub's replacement for password-based git
  authentication over HTTPS.
- **React Context**: a way to share state (like "who's logged in") across
  many components without passing props down manually through every level.
  `AuthProvider` + `useAuth()` is this pattern in action.
- **Unsigned upload presets (Cloudinary)**: lets a browser upload files
  directly to a third-party service without needing a backend server or
  exposing secret API keys — safe because the preset limits what can be
  uploaded and where.
- **Stale dev server / cache issues**: sometimes code changes don't show up
  even when saved correctly — restarting `npm run dev` and hard-refreshing
  the browser (`Cmd+Shift+R`) resolves most of these.