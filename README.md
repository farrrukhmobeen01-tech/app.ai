# CampusFlow AI

CampusFlow AI is an AI-powered university student productivity and academic management platform designed to unify academic organization, AI assistance, project management, career preparation, and campus guidance into a single, cohesive application.

---

## 1. Project Overview

University students face a demanding academic environment where coursework, exams, team projects, career planning, and university policies compete for time and attention. **CampusFlow AI** was created as an all-in-one smart workspace specifically tailored to university and college students.

Rather than fragmenting student workflows across multiple disjointed tools, CampusFlow AI integrates intelligent academic tracking with embedded AI assistants powered by Google's Gemini API. From breaking down complex lecture notes and automatically scheduling study blocks to evaluating academic risk and generating step-by-step career roadmaps, CampusFlow AI serves as an intelligent co-pilot throughout a student's entire degree journey.

---

## 2. The Real Problem

### The Challenge
University students routinely manage:
* Multiple courses with distinct syllabi and grade weightings
* Overlapping assignments, quizzes, midterms, and final exams
* Group projects requiring task division and milestone tracking
* Career development, resume building, and skill mapping
* Administrative campus procedures and institutional communications

When these tasks are managed across separate calendars, note-taking apps, spreadsheets, and generic chat assistants, students experience:
1. **Information Overload & Fragmentation:** Key dates and study materials get buried across multiple platforms.
2. **Missed Deadlines & Reactive Studying:** Without unified scheduling and risk tracking, deadline conflicts are discovered too late.
3. **Academic Stress & Burnout:** Unstructured study habits lead to inefficient cramming rather than consistent, spaced learning.
4. **Generic AI Tools:** Standard chatbots lack the context of a student's specific courses, deadlines, grade history, and career goals.

### The Solution
**CampusFlow AI** addresses these challenges directly by providing a context-aware student ecosystem:
* **Centralized Academic Hub:** All courses, assignments, assessments, study logs, and group projects reside in a single database connected to Cloud Firestore.
* **Context-Driven AI Engines:** AI features analyze the student's actual active courses, upcoming deadlines, grade averages, and availability to offer personalized recommendations.
* **Proactive Risk Radar:** Evaluates academic performance in real time to alert students to falling grades or tight deadline clusters before they become critical.
* **Integrated Career Pipeline:** Translates academic progress into professional readiness through AI-generated career roadmaps and resume-to-portfolio parsing.

### Target Audience
* **University & College Undergraduate Students** seeking structured academic organization.
* **Graduate Students** managing multi-faceted research projects, writing, and course loads.
* **Students Balancing Multiple Courses & Deadlines** who need automated scheduling and risk evaluation.
* **Future Graduates & Job Seekers** looking to align their degree coursework with real-world industry skills.

---

## 3. Live Demo

* **Live Application:** [Launch CampusFlow AI](https://app-ai-mu-nine.vercel.app/)
* **Public GitHub Repository:** [View Source Code on GitHub](https://github.com/farrrukhmobeen01-tech/app.ai)

---

## 4. Features

All listed features are fully implemented and functional in the application codebase:

### Academic & Course Management
* **Academic Overview Dashboard:** Real-time summary of overall GPA/grade average, upcoming deadlines, weekly study hours, and AI academic insights.
* **Course Management:** Add and organize courses with color tags, instructor details, syllabus context, and schedule information.
* **Assignment & Deadline Tracking:** Priority-based task tracking with countdown timers, submission status, and course linking.
* **Assessment & Grade Performance Tracker:** Log quizzes, midterms, finals, and lab reports with weightings to calculate current course performance.
* **Study Session Management:** Track real-time study sessions, duration, subject focus, and historical study logs.

### AI-Powered Learning & Productivity
* **AI Study Assistant:** Interactive learning co-pilot supporting concept explanations, practice question generation, and material breakdown.
* **AI Multiple Choice Generator (MCQs):** Automatically generates targeted practice MCQs based on course topics and input notes.
* **AI Flashcard Generator:** Transforms study text into active-recall flashcard sets with prompt/answer pairs.
* **AI Summary Generator:** Produces structured Markdown summaries highlighting core takeaways, formulas, and key terminology.
* **AI Personalized Study Plan Generator:** Builds structured weekly study timetables tailored to specific course difficulty and upcoming exams.
* **AI Automatic Scheduler:** Distributes study sessions intelligently based on student daily availability windows and deadline urgency.
* **Academic Risk Analysis Radar:** Scans grade averages, upcoming due dates, and study hours to detect potential academic vulnerabilities.

### Collaboration & Career Tools
* **Group Project Planning & Breakdown:** AI manager that decomposes group projects into sequential phases, milestones, and assigned team tasks.
* **Interactive Project Task Board:** Kanban-style or checklist view for tracking individual and group project deliverables.
* **Campus Help Center:** AI-assisted campus guidance directory addressing academic inquiries, student services, and university administration procedures.
* **AI Academic Writing Assistant:** Drafts formal academic correspondence, professor emails, leave requests, and grade inquiry letters.
* **AI Code Assistant:** Specialized debugging tutor for Computer Science and Engineering students, offering line-by-line error breakdowns and corrections.
* **AI Career Roadmap Generator:** Constructs step-by-step skill acquisition pathways, project milestones, and course alignment for target job roles.
* **AI Resume-to-Portfolio Parser:** Extracts work experience, projects, and technical skills from uploaded resumes or raw text to auto-populate student profiles.

### User Authentication, Persistence & Customization
* **Firebase Authentication:** Secure login via Email/Password and Google Sign-In.
* **Cloud Firestore Storage:** Real-time persistent data storage for all user profiles, courses, tasks, sessions, and AI results.
* **Theme Customization:** Toggle between modern light, dark, and system themes with persistent user preferences.

---

## 5. AI-Powered Features

Rather than operating as an isolated, generic chatbot window, the AI in **CampusFlow AI** is deeply embedded into specific student workflows. The backend API proxies requests to Google's Gemini models using the modern `@google/genai` SDK with strict JSON schema enforcement and system prompts.

| AI Feature | Functionality & Problem Solved |
| :--- | :--- |
| **AI Study Assistant** | Simplifies complex academic topics step-by-step. Solves the problem of getting stuck on difficult textbook concepts or lecture slides without instructor availability. |
| **AI MCQ Generator** | Converts study notes into active practice tests. Solves passive reading habits by forcing active recall testing prior to exams. |
| **AI Flashcard Generator** | Produces digital flashcards instantly from syllabus content. Eliminates manual card creation time so students focus on active retrieval. |
| **AI Summary Generator** | Synthesizes lengthy articles and lecture notes into key takeaways and formulas. Reduces review time during exam preparation. |
| **AI Personalized Study Planner** | Formulates structured study schedules tailored to course weightings and exam dates. Solves poor time management and unorganized study habits. |
| **AI Automatic Scheduler** | Distributes study blocks into available student time slots without overlapping. Prevents scheduling conflicts and cramming. |
| **AI Academic Risk Radar** | Evaluates current course averages, deadline clusters, and study hours. Proactively alerts students to academic risks before grades decline. |
| **AI Project Manager** | Decomposes group project briefs into team milestones and deliverables. Prevents unequal workload distribution and missed project milestones. |
| **AI Campus Guidance** | Answers university procedures and academic policy questions. Helps students navigate campus administration efficiently. |
| **AI Writing Assistant** | Drafts articulate emails to faculty and administrative requests. Assists students in communicating professionally with academic personnel. |
| **AI Code Assistant** | Diagnoses syntax errors and runtime bugs while explaining the underlying CS principles. Helps programming students learn bug resolution without simple copy-pasting. |
| **AI Career Roadmap** | Generates sequential skill targets and project goals based on desired job titles. Helps students build job-ready portfolios alongside their degree. |
| **AI Resume Parser** | Extracts structured profile data from unstructured resume text. Automatically updates portfolio skills and project history. |

---

## 6. AI Instructions and System Prompts

All AI workflows in CampusFlow AI rely on tailored system instructions enforced on the Express backend (`src/server/app.ts`) to ensure pedagogical value, safety, and consistent JSON responses.

### 1. Academic AI Assistant
> *System Persona:* "You are CampusFlow AI, an academic assistant for university students. Your goal is to help students understand their study material, not simply give answers. When explaining a topic, break down complex concepts into simple step-by-step explanations, use clear real-world examples, highlight common misunderstandings or student pitfalls, and conclude with a concise summary."

### 2. Academic Performance Advisor
> *System Persona:* "You are a supportive university academic performance advisor and Academic Risk Radar. Analyze student course averages, assignment weightings, and study hour logs. Identify risk levels (Low, Medium, High), highlight specific weak areas, and provide actionable, encouraging steps to improve performance."

### 3. Campus Guidance Assistant
> *System Persona:* "You are CampusFlow AI, a university guidance assistant. Analyze the student's issue and provide practical next steps, key departments to contact, and guidance on academic policies. Clearly distinguish between general guidance and official institutional policies that require direct verification with university staff."

### 4. Technical Project Manager
> *System Persona:* "You are a technical project manager for university group projects. Decompose project requirements into logical sequential phases, distribute tasks evenly across team size, assign priority levels, and specify realistic estimated hours for each deliverable."

### 5. Career Roadmap Strategist
> *System Persona:* "You are an elite career strategist for university students. Given a target role and degree, construct a multi-stage development roadmap including recommended technical skills, portfolio projects, certifications, and course alignments."

### 6. Academic Writing Assistant
> *System Persona:* "You are a professional university correspondence writer. Draft articulate, polite, and formal academic emails, leave applications, and administrative letters while maintaining the student's core request and context."

### 7. CS/Engineering Code Assistant
> *System Persona:* "You are an expert programming tutor for university CS/Engineering students. Analyze code snippets and error messages to explain why the error occurred, point out the specific causing line, provide a clear fix, and explain the underlying CS concept in beginner-friendly terms."

*Note: All API routes execute server-side. No API keys, credentials, or private environment variables are exposed to the client or codebase.*

---

## 7. Technology Stack

### Frontend
* **React (v18+)** – Component-based UI library
* **TypeScript** – Static type safety across client and server logic
* **Vite** – Next-generation frontend build tooling
* **Tailwind CSS** – Utility-first responsive styling
* **Lucide React** – Clean, modern icon set
* **Motion (`motion/react`)** – Smooth UI animations and route transitions
* **Recharts** – Data visualization for grade analytics and study history charts

### Backend & AI API
* **Node.js & Express** – Server API runtime handling AI proxies and logic
* **Google Gemini API (`@google/genai`)** – Server-side AI intelligence engine
* **Firebase Authentication** – User authentication (Email/Password & Google OAuth)
* **Cloud Firestore** – NoSQL document database for multi-device sync

### Deployment & Infrastructure
* **Vercel** – Global serverless hosting for frontend assets and Express API routes
* **GitHub** – Version control and source code repository

---

## 8. Application Architecture

```
                       ┌─────────────────────────────────────────┐
                       │             React + Vite SPA            │
                       │   (Tailwind CSS, Recharts, Lucide UI)   │
                       └────────────────────┬────────────────────┘
                                            │
                                 HTTPS REST API Requests
                                            │
                       ┌────────────────────▼────────────────────┐
                       │          Express API Backend            │
                       │     (Vercel Serverless Function)        │
                       └──────────┬───────────────────┬──────────┘
                                  │                   │
                  Firebase Auth & │                   │ Google Gemini API
                  Firestore SDK   │                   │ (@google/genai)
                                  │                   │
                       ┌──────────▼──────────┐ ┌──────▼──────────┐
                       │  Cloud Firestore &  │ │   Gemini 2.5/   │
                       │    Firebase Auth    │ │  Flash Models   │
                       └─────────────────────┘ └─────────────────┘
```

1. **Client Layer:** Single-Page Application (SPA) built with React and TypeScript, using Tailwind CSS for responsive styling and Motion for dynamic UI transitions.
2. **Authentication & Persistence:** Client connects directly to Firebase SDK for user authentication and real-time document listener synchronization with Cloud Firestore.
3. **Backend API Layer:** Express application hosted on Vercel as a serverless entry point (`/api/*`). Handles complex data aggregations and proxies AI queries safely.
4. **Secure Gemini Integration:** All requests to `@google/genai` are executed strictly inside the Express server backend. The `GEMINI_API_KEY` environment variable is stored securely on the server and is **never** sent or exposed to the client browser.

---

## Screenshots

### Dashboard
![CampusFlow AI Dashboard](./public/screenshots/dashboard.png)

### AI Study Assistant
![AI Study Assistant](./public/screenshots/study-assistant.png)

### Career Roadmap
![Career Roadmap](./public/screenshots/career-roadmap.png)
---

## 10. Getting Started

Follow these steps to run CampusFlow AI locally on your machine.

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)
* A **Firebase Project** with Firestore and Authentication enabled
* A **Google Gemini API Key**

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/farrrukhmobeen01-tech/app.ai.git
   cd app.ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   # Server-side Gemini API Key (Secret - Never prefix with VITE_)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Client-side Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 11. License & Acknowledgments

* Developed as a comprehensive final project submission for academic evaluation.
* Powered by Google's **Gemini AI**, **Firebase**, **React**, and **Vercel**.
