# HostelThrift — Project Log & Learning Notes

A running record of what the project is, what's been built, decisions made,
and what's coming next. Keep updating this as you go.

---

## 1. What This Project Is

A hyperlocal, peer-to-peer thrift marketplace for college hostel residents
to buy, sell, and bargain on second-hand clothes, bags, and essentials —
with zero shipping fees, since everyone lives in the same hostel.

---

## 2. Tech Stack (Decided & Why)

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript + Tailwind CSS | One repo for frontend + backend logic, fast styling |
| Backend/Database | Firebase (Firestore) | Free tier is generous, no separate backend server needed |
| Auth | Firebase Authentication (Email/Password) | Built-in, easy to restrict to college email domain |
| Image Storage | Firebase Storage | Same ecosystem as Auth/DB |
| Deployment (planned) | Vercel | Free, integrates natively with Next.js |
| Version Control | Git + GitHub | Industry standard, portfolio visibility |

---

## 3. Scope Decisions (v1 vs later)

**Cut from v1, deferred to later:**
- ID card upload + admin verification queue
- Structured "offer" system with Accept/Reject/Counter buttons
- Real-time chat via WebSockets (using polling instead — refetch every ~10s)
- Wishlist, purchase history, earnings tracker, analytics dashboard
- Admin panel UI (manual moderation for now)

**v1 core loop:**
1. Sign up with college email (@cujammu.ac.in only)
2. Post an item (title, category, condition, price, photos, hostel, room)
3. Browse/search/filter items
4. Message the seller (in-app, simple threaded chat)
5. Seller marks item Available / Reserved / Sold
6. Manual admin moderation

---

## 4. Database Schema (Firestore)

### `users` collection

---

## 5. What's Been Built So Far

### Project setup
- GitHub repo `HostelThrift` created (private)
- Next.js scaffolded (TypeScript, Tailwind, App Router, ESLint)
- `.gitignore` fixed to exclude node_modules/.next/.env.local
- Git history cleaned once (node_modules got committed by mistake early on)

### Firebase setup
- Project `hostel-thrift` created (free Spark plan)
- Authentication enabled (Email/Password)
- Firestore Database created (test mode)
- Storage bucket created
- Firebase SDK installed, config in `.env.local` (not committed to git)
- `src/lib/firebase.ts` initializes and exports auth, db, storage

### Signup page
- Fields: Name, College Email, Password, Hostel Name, Room Number
- Validates email ends with @cujammu.ac.in
- Creates Firebase Auth user + saves profile to Firestore `users` collection
- Tested end-to-end successfully

---

## 6. Bugs Hit & Fixes (good to remember!)

| Problem | Cause | Fix |
|---|---|---|
| npm naming restrictions error | Folder name had capital letters | Scaffolded in lowercase temp folder, moved files over |
| Git push asked for password, didn't work | GitHub removed password auth | Used a Personal Access Token instead |
| node_modules pushed to GitHub | .gitignore didn't exist yet | git rm --cached, added .gitignore, reset git history, force pushed |
| Module not found '@/lib/firebase' | tsconfig.json had broken alias "default@/*" | Fixed to "@/*": ["./src/*"] |
| auth/configuration-not-found | Authentication wasn't "started" in Firebase console yet | Clicked "Get started" on Auth page, retried |
| auth/email-already-in-use | Not a bug — signup had already succeeded once | Used a new test email |

---

## 7. What's Next

1. Login page
2. Auth state handling (redirect if not logged in)
3. Navbar (Home / Sell / Chats / Profile + logout)
4. Item listing form ("Sell" page) with image upload
5. Browse/home feed with filters
6. Item detail page
7. Simple polling-based chat
8. Seller dashboard
9. Deploy to Vercel

---

## 8. Useful Commands Reference

```bash
cd HostelThrift
npm run dev              # start local server
Ctrl + C                 # stop server
git status                # check changes
git add .
git commit -m "message"
git push origin main
open -a TextEdit filename # open a file in editor
```

---

## 9. Key Concepts Learned

- **Git vs GitHub**: Git = local version control tool, GitHub = cloud backup/hosting
- **.gitignore**: tells git which files to never track (node_modules, .env.local)
- **Environment variables**: keep secret config out of code and git
- **Path aliases (@/*)**: shortcut for imports, configured in tsconfig.json
- **Firebase Auth vs Firestore**: Auth = login/passwords, Firestore = database — separate services, must write data to Firestore explicitly
- **Personal Access Tokens**: GitHub's replacement for git password auth