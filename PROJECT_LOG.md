# HostelThrift — Project Log & Learning Notes

**Status: 🚀 Live at https://hostel-thrift.vercel.app — core v1 complete**

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
| Image Storage | Cloudinary | Switched from Firebase Storage — see Decision Log |
| Deployment | Vercel | Free, integrates natively with Next.js — **live** |
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

### `items` collection
```
sellerId      (string, references users doc ID)
sellerName    (string)
hostelBlock   (string)
title         (string)
description   (string)
category      (string — e.g. "Western Wear", "Electronics", etc.)
condition     (string — e.g. "Like New", "Gently Used", etc.)
price         (number)
status        (string: "available" | "reserved" | "sold")
imageUrls     (array of strings, from Cloudinary)
createdAt     (string, ISO date)
```

### `conversations` collection
```
itemId        (string, references items doc)
itemTitle     (string)
itemImage     (string, first image URL)
buyerId       (string, references users doc)
sellerId      (string, references users doc)
sellerName    (string)
createdAt     (string, ISO date)
```

### `messages` subcollection (nested under each conversation: `conversations/{id}/messages`)
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
- Each card links to `/item/[id]`
- Shows a logged-out landing message with a Log In link if not authenticated

### ✅ Item detail page (`src/app/item/[id]/page.tsx`)
- Dynamic route using Next.js `[id]` folder convention
- Shows full image gallery (with thumbnail switcher), title, price,
  category/condition tags, description, seller name, hostel
- **"Message Seller" button** (hidden if viewing your own item, or if the
  item isn't `available`): checks for an existing conversation between this
  buyer and this item first (avoids duplicates), reuses it if found,
  otherwise creates a new `conversations` doc, then routes to the chat thread
- **Seller-only controls** (shown only if you're the listing's owner):
  - Status toggle buttons: Available / Reserved / Sold — updates the
    item's `status` field in Firestore instantly, reflected everywhere
    (homepage grid shows a "Sold"/"Reserved" tag; Message button disappears
    for buyers once not available)
  - **Delete Listing** button — confirms first, then deletes the item doc
    from Firestore and redirects home (note: doesn't clean up the images
    from Cloudinary, only removes the Firestore record)

### ✅ Chat — thread page (`src/app/chats/[id]/page.tsx`)
- Fetches the conversation's details once, and its messages on load
- **Polls every 5 seconds** to check for new messages (the "not-real-time
  but good enough" approach planned from the start)
- Sending a message writes to the `messages` subcollection, and is also
  added to local state immediately so it appears instantly instead of
  waiting for the next poll
- Messages align right (black bubble) if sent by you, left (gray) if from
  the other person
- Auto-scrolls to the latest message

### ✅ Chat — list page (`src/app/chats/page.tsx`)
- Fetches conversations two ways — where you're the buyer, and separately
  where you're the seller — then merges them into one list (Firestore's
  free-tier query setup doesn't easily support "where A or B" across
  different fields in one query)
- Each row links to that conversation's thread page
- Tested successfully with two separate logged-in accounts messaging back
  and forth about a real listing

### ✅ Deployed to Vercel
- Live at **https://hostel-thrift.vercel.app**
- Connected via GitHub integration (Vercel auto-installs as a GitHub App,
  scoped to just the `HostelThrift` repo)
- All 6 Firebase config values added manually as Environment Variables in
  Vercel's project settings (since `.env.local` is correctly gitignored
  and never gets pushed, Vercel doesn't see it automatically)
- Confirmed working end-to-end on the live URL: signup, login, browse,
  post an item, chat — all tested directly on production, not just localhost

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
| `Can't find variable: handleDelete` runtime error | While adding a delete handler, the new function got pasted *inside* the middle of the existing `handleMessageSeller` function instead of after it, breaking both | Rewrote the whole file cleanly, with each function properly separated |
| `git push` rejected with "fetch first" (happened a couple of times) | An edit was made directly on GitHub's website (e.g. ticking a README checkbox), creating a commit there that the local copy didn't have yet | `git pull origin main --no-rebase` to merge remote changes in first, then push |

**Lesson:** most of these were environment/setup/caching issues, not logic
bugs — completely normal for a first real project. When something looks
broken but the code looks correct, try in order: hard refresh browser →
restart dev server → check browser console for the actual error. When a
function suddenly "can't find" something it clearly defines, check that a
copy-paste didn't land *inside* another function instead of after it.

---

## 8. What's Next (post-launch polish)

The v1 core loop is complete and live. Everything below is optional polish,
not required for real hostel use:

1. **Search & filters** on the homepage (category, price range, size)
2. **Seller dashboard** — a dedicated page listing just "my active items"
   with quick status/delete actions, instead of navigating to each item
3. **Edit listing** — currently you can change status or delete, but not
   edit the title/price/photos of an existing listing
4. **Show buyer's real name in chat** — right now the seller's side of a
   chat just shows "Buyer" instead of the actual buyer's name
5. **Clean up Cloudinary images on delete** — deleting a listing currently
   only removes the Firestore doc, images stay in Cloudinary
6. **Firestore security rules** — currently in "test mode" (fully open).
   Before wider launch, tighten rules so, e.g., only a document's owner can
   edit/delete it, enforced server-side (not just hidden in the UI)
7. **Custom domain** (optional) — Vercel gives a free `.vercel.app` URL;
   could add a custom domain later if wanted

---

## 9. Launch Checklist (for actually rolling out to the hostel)

- [ ] Post 10-15 real items yourself before announcing, so it doesn't look empty
- [ ] Get 2-3 friends to commit to posting on launch day
- [ ] Share the live link in hostel WhatsApp/group chats
- [ ] Keep an eye on Firestore/Cloudinary usage in their free-tier dashboards
      for the first week or two, just to get a feel for real usage volume

---

## 10. Useful Commands Reference

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

## 11. Key Concepts Learned So Far

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
- **Firestore subcollections**: a collection can be nested inside a specific
  document (e.g. `conversations/{id}/messages`) rather than sitting at the
  top level — keeps related data (all messages for *one* conversation)
  scoped together instead of filtering one giant flat collection.
- **Environment variables in deployment**: `.env.local` only exists on your
  own computer and is deliberately never pushed to GitHub. A hosting
  platform like Vercel has no way to see those values automatically — they
  have to be re-entered manually in the platform's own settings (Vercel's
  "Environment Variables" section) so the deployed app can access them.
- **Polling vs WebSockets, in practice**: seeing the 5-second-delay chat
  actually feel "fine" in real use confirmed the original scoping call —
  for a hostel-scale app, simple polling is genuinely good enough, and the
  complexity of real-time infrastructure wasn't needed for v1.