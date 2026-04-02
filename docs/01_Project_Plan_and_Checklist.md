# Project Plan and Transition Checklist

## Phase 1: Frontend UI Migration (Day 1)
**Status:** High Priority Prerequisite
- [ ] Initialize Next.js frontend project.
- [ ] Convert `login.html`, `registration.html`, and `feed.html` into static Next.js pages/components.
- [ ] Port all Vanilla CSS exactly as provided to ensure 100% design fidelity.
- [ ] Push the clean, un-ejected Next.js UI to the `main` branch. This will serve as the baseline that all teams will branch from to avoid setup-level merge conflicts.

## Phase 2: Parallel Feature Development (Day 2-8)
**Status:** Blocked by Phase 1 (Multiple Branches Strategy)
- [ ] **Setup**: Initialize Fastify/Node backend and SQLite Database schema (Can be handled by a Backend Lead while Phase 1 finishes).
- [ ] **Auth Team**: Checkout branch `feat/auth` -> Implement `02_FRD_Authentication.md` (Login/Registration logic).
- [ ] **Feed Team**: Checkout branch `feat/feed` -> Implement `03_FRD_Feed_and_Posts.md` (APIs & wiring up the feed).
- [ ] **Interaction Team**: Checkout branch `feat/interactions` -> Implement `04_FRD_Social_Interactions.md` (Likes & Comments).
- [ ] **Visibility Team**: Checkout branch `feat/visibility` -> Implement `05_FRD_Post_Visibility.md` (Public/Private query logic).

## Phase 3: Integration (Day 9-11)
- [ ] Link JWT Authentication state to globally protect the Feed route.
- [ ] Remove mock data from the Feed/Interaction components and wire up real backend API responses.
- [ ] Verify that liking/commenting creates accurate database records linked to the specific JWT-authenticated user.
- [ ] Verify that public posts show up for everyone, and private posts only for the author.

## Phase 4: Final QA & Deployment (Day 12-14)
- [ ] UI visual check: Compare React App to original HTML/CSS to ensure exact match.
- [ ] Security check: Verify the feed cannot be accessed without login, and private posts are secure at the DB level, not just the UI level.
- [ ] Deploy Application (Frontend hosted on Vercel/Netlify; Backend on Render/Railway).
