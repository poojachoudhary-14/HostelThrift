# HostelThrift

A hyperlocal peer-to-peer thrift marketplace built for hostel residents 
to buy, sell, and bargain on second-hand clothes, bags, and essentials — 
with zero shipping fees.

## Status: In development 🚧

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS + TypeScript
- **Backend/Database:** Firebase (Firestore)
- **Auth:** Firebase Authentication (restricted to college email domain)
- **Storage:** Firebase Storage (for item images)
- **Deploy:** Vercel

## Features (planned)
- [x] Project scaffold (Next.js + Tailwind)
- [ ] Auth with college email restriction
- [ ] Item listing (create, edit, delete, mark sold)
- [ ] Browse & search with category/price/size filters
- [ ] In-app messaging (buyer-seller chat per item)
- [ ] Seller dashboard (active listings, incoming interest)
- [ ] Admin moderation (report/remove listings)

## Getting Started

First, install dependencies:

\`\`\`bash
npm install
\`\`\`

Then run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## About

Built as a college project to solve a real problem — students accumulate 
clothes, bags, and gear they no longer need, and a hostel-only marketplace 
makes buying/selling low-friction, trustworthy (college email verified), 
and free of shipping hassle since everyone's in the same building.
