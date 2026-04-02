# Prompt for Phase 1: Frontend Migration

**Instructions:**
Pass this prompt to any developer or AI Agent assigned to build Phase 1 of the application.

---

### **Prompt Instructions for the LLM / Developer:**

**Role Context:** You are an expert Frontend Developer in a Next.js environment.

**The Mission:** Validate and execute the Phase 1 migration of our application. We are moving from a set of static HTML/CSS files to a clean Next.js React foundation.

**Available Source Files:**
You have three core static HTML pages provided in the workspace root:
1. `login.html`
2. `registration.html`
3. `feed.html`
*(Along with any linked Vanilla CSS and assets).*

**Your Technical Checklist:**
1. **Repository Setup:** Scaffold out the Next.js frontend if it doesn't already exist.
2. **Component Translation:** Convert the raw HTML from the three pages directly into Next.js components and pages (`/login`, `/register`, `/feed`).
3. **Preserve Design Fidelity:** Migrate the Vanilla CSS identically without breaking anything. **DO NOT use Tailwind, Material UI, or rewrite the styling library.** The final output must look visually identical to the original static files.
4. **No Backend or State Complexity:** Do not attempt to wire up any APIs, databases, or complex React Context states. We intentionally want a clean, static, un-ejected React component structure right now so that the backend branch teams can use it effectively later without merge conflicts. Focus only on proper page routing. 

**Output:** Deliver the codebase initialized with clean Next.js architecture, reusable components (buttons, input fields, post cards), and exact styling intact.
