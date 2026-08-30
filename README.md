# HostelThrift

A hyperlocal peer-to-peer thrift marketplace built for hostel residents 
to buy, sell, and bargain on second-hand clothes, bags, and essentials — 
with zero shipping fees.

## Status: Core features complete, still a lot to do 🚧

## Tech Stack
- **Frontend:** Next.js (App Router) + Tailwind CSS + TypeScript
- **Backend/Database:** Firebase (Firestore)
- **Auth:** Firebase Authentication (restricted to college email domain)
- **Storage:** Firebase Storage (for item images)
- **Deploy:** Vercel

## Features (planned)
- [x] Project scaffold (Next.js + Tailwind)
- [x] Auth with college email restriction
- [x] Item listing (create, edit, delete, mark sold)
- [ ] Browse & search with category/price/size filters
- [x] In-app messaging (buyer-seller chat per item)
- [ ] Seller dashboard (active listings, incoming interest)
- [ ] Admin moderation (report/remove listings)
## Live App

🌐 [hostel-thrift.vercel.app](https://hostel-thrift.vercel.app)      

## Running Locally (for development)

````bash
npm install
npm run dev
````

Open [http://localhost:3000](http://localhost:3000) in your browser.

## About

Built as a college project to solve a real problem — students accumulate 
clothes, bags, and gear they no longer need, and a hostel-only marketplace 
makes buying/selling low-friction, trustworthy (college email verified), 
and free of shipping hassle since everyone's in the same building.
