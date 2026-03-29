# TutorIA - AI Agent Context Document

This document serves as the primary technical context for AI agents working on the TutorIA repository. It contains stable architectural and structural information to minimize the need for full-codebase scans.

## 1. Project Overview
TutorIA is a personalized AI-powered tutoring web application tailored for university engineering students (specifically targeting FING, Udelar in Uruguay). Its core functionality provides interactive, subject-specific chat assistance using a Retrieval-Augmented Generation (RAG) system. 

**Main Use Cases:**
- Interactive study sessions categorized by Subject (Materia) and Instance (e.g., "Primer Parcial", "Prácticos").
- Adaptive question and answer sessions based on student proficiency and weak topics.
- Administrator interface for managing subjects, instances, and uploading PDF study materials to feed the AI's knowledge base.

## 2. Tech Stack
- **Languages:** TypeScript, HTML, CSS (Tailwind)
- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Hosted on Neon)
- **ORM:** Prisma
- **AI Integration:** Google GenAI (`@google/genai` using Gemini models like `gemini-2.5-flash`)
- **Key Packages:** `bcryptjs` (hashing), `jsonwebtoken` (auth), `multer` & `pdf-parse` (file processing).

## 3. Repository Structure
The repository combines both frontend and backend in a streamlined monolithic setup.

```text
/
├── server.ts             # Main Node.js/Express backend server & API definitions.
├── prisma/               # Database definitions and seed scripts.
│   ├── schema.prisma     # Prisma data models.
│   └── seed.ts           # Initial DB population (users, subjects, baseline RAG data).
├── src/                  # Frontend React application.
│   ├── App.tsx           # Giant monolithic UI component controlling routing & views.
│   ├── components/       # Extracted React components (e.g., FormulasPanel).
│   ├── services/         # API layer (api.ts) making fetch calls to the backend.
│   └── index.css         # Tailwind initialization and global styling.
├── package.json          # Dependencies and npm scripts.
└── vite.config.ts        # Vite configuration.
```

## 4. Core Architecture
- **Client-Server Flow:** The Vite-built React app acts as a Single Page Application (SPA). It communicates via HTTP REST calls to the Express application defined in `server.ts`. 
- **Development vs. Production:** In development, `server.ts` spins up Express and attaches Vite's development middleware. In production, Express statically serves the `/dist` directory built by Vite.
- **RAG Architecture:** The AI does not rely purely on base model knowledge. When a user chats, the backend retrieves relevant text chunks from the PostgreSQL database (uploaded previously by an admin) and injects them into the Gemini prompt as "source of truth" context.

## 5. Key Components
- **`App.tsx` (Frontend Router/View Manager):** Because the app does not use a traditional router library (like `react-router`), `App.tsx` holds the global view state (`view === 'dashboard'`, `view === 'chat'`) and renders components conditionally.
- **`/api/chat` Route (Backend):** The heart of the application logic located in `server.ts`. It retrieves user profiles, recent exercises, handles RAG context lookups, formats dynamic instructions, and proxies the request to the Google GenAI API.
- **PDF Upload Flow:** The `/api/admin/upload-knowledge` uses `multer` for memory storage and `pdf-parse` to extract text, which is naively bucketed into ~1000 character chunks for database storage.

## 6. Data Layer
- **Database:** PostgreSQL.
- **ORM Tool:** Prisma.
- **Key Schemas (`prisma/schema.prisma`):**
  - `User`, `UserProfile`, `Subscription`: Authentication and user metadata.
  - `Subject`, `Category`: A Subject ("Cálculo 1") has multiple Categories/Instances ("Primer Parcial").
  - `KnowledgeBase`: Stores exact chunks of text tied to a Category to be used in AI prompts.
  - `UserProgress`, `Exercise`: Tracks interaction counts and records specific topics a student understands or struggles with.
  - `ChatMessage`: Chat history logging.

## 7. APIs
All backend logic is inside `server.ts` and prefixed with `/api`.
- **Authentication:** `POST /api/auth/register`, `POST /api/auth/login`. Secures protected endpoints using JWT (`Authorization: Bearer <token>`).
- **Data Sync:** `GET /api/user/dashboard`, `POST /api/study-session/sync`.
- **Chat & AI:** 
  - `GET /api/chat/welcome`: Dynamically generates contextual welcomes depending on past study sessions.
  - `POST /api/chat`: Processes chat messages, fetches relevant DB knowledge, calls Gemini, and tracks user progress.
- **Admin Tools:** `POST /api/admin/subjects`, `POST /api/admin/categories`, `POST /api/admin/upload-knowledge`.

## 8. Environment & Configuration
Managed via a local `.env` file (ignored by git).
- `DATABASE_URL`: Connection string for the PostgreSQL database (typically a Neon serverless string).
- `GEMINI_API_KEY`: Secret string to authenticate with the Google GenAI service.
- `JWT_SECRET`: Signing key for JSON Web Tokens.
- `NODE_ENV`: Standard environment flag (development/production).

## 9. Development Workflow
- **Setup:** `npm install`
- **Database Sync:** `npx prisma db push`
- **Database Seed:** `npm run seed` (Crucial step: populates admin users and initial subject knowledge).
- **Run Application:** `npm run dev` (Boots `server.ts` with tsx, running both API and Frontend).
- **Build for Production:** `npm run build` (compiles React into `/dist`).

## 10. Important Conventions
- **Naming & Language:** The UI, code comments, system prompt instructions, and database seeds are heavily written in Spanish. Tone instructions specific to the FING university style are hardcoded in the prompts.
- **Frontend Architecture:** Component styling heavily utilizes Tailwind utility classes.
- **State Management:** Simple React hooks (`useState`, `useEffect`) manage state. There is no Redux or complex global state management framework. 

## 11. Known Constraints or Assumptions
- **Basic RAG Extraction:** The knowledge base splits file text coarsely by 1000-character segments using regex (`/[\s\S]{1,1000}/g`). It does not presently use vector embeddings (`pgvector`) or semantic search, relying instead on fetching recent generic chunks tied to an instance ID.
- **Monolithic Frontend:** The frontend architecture relies on a massive `App.tsx` file for routing. Care must be taken when modifying view transitions to not break component state.
- **Prompt Logic Coupling:** AI prompt construction is tightly interwoven with route logic inside `server.ts` rather than abstracted into a dedicated prompt-management service.
