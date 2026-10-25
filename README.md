# CelebrateAI – GenAI Celebration & Event Planner

[![CI Quality & Test Pipeline](https://github.com/thisispremkumar/celebrate-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/thisispremkumar/celebrate-ai/actions/workflows/ci.yml)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Zero_Any-blue.svg)](https://www.typescriptlang.org/)
[![Oxlint Quality Gate](https://img.shields.io/badge/Oxlint-0_Warnings_0_Errors-brightgreen.svg)](https://oxc.rs/)
[![Tests Passing](https://img.shields.io/badge/Vitest-29%2F29_Passed-success.svg)](https://vitest.dev/)

> Autonomous, Generative AI-powered planning assistant designed to help users organize **Weddings, Birthdays, and Community Events** with real-time budgets, interactive timelines, vendor checklists & RFPs, and personalized experiential ideas.
> 
> 🌐 **Live Cloud Run Deployment**: [https://celebrate-ai-730243407394.us-central1.run.app](https://celebrate-ai-730243407394.us-central1.run.app)

---

## 🌟 Key Features

### 1. Multi-Archetype Event Architect
- **Weddings**: Ceremony, Reception, Farm-to-Table catering, golden hour photography, floral design, and guest management.
- **Milestone Birthdays**: Themed decor, signature mixology, DJs/lighting, and instant photo keepsakes.
- **Community Festivals**: City permit tracking, stage & sound logistics, volunteer briefings, food stalls, and zero-waste initiatives.
- **Custom Event Creation Wizard**: Dynamically seeds tailored budget distributions and milestone schedules based on guest count and target limits.

### 2. Smart Budget Engine
- **Real-Time Financial Tracking**: Planned vs. Committed vs. Cleared Payments.
- **Category Spending Distribution Visualizer**: Interactive allocation bars with custom color tokens.
- **AI Cost-Optimization Diagnostics**: Automatically detects category overruns and recommends actionable savings (e.g. beverage package alternatives, floral repurposing).
- **Data Export**: 1-click **Export to CSV**.

### 3. Dynamic Interactive Timeline & Run-of-Show
- **Phased Master Timeline**: Phased countdown from Months Before down to Days Before and Post-Event wrap-up.
- **Day-of Run of Show**: Minute-by-minute cue schedule with exact timestamps.
- **AI Task Suggester**: Analyzes missing milestones and proposes tailored tasks.
- **iCalendar Sync**: 1-click **Export to .ICS** format for Google Calendar, Apple Calendar, and Outlook.

### 4. Vendor CRM & 1-Click AI RFP Generator
- Full vendor pipeline status tracking (*To Research*, *Inquiry Sent*, *Quoted*, *Contract Signed*, *Deposit Paid*, *Completed*).
- Star rating system, contract notes, and deposit tracking.
- **1-Click AI RFP Generator**: Instantly drafts polite, professional inquiry letters tailored to the vendor's category, event date, venue, headcount, and budget.

### 5. Personalized AI Inspiration Hub
- Curated experiential ideas across Themes, Decor, Menus & Cocktails, Entertainment, Games, Favors, Eco-Friendly strategies, and Budget Hacks.
- 1-click **"To Timeline"** and **"To Budget"** converters that turn creative concepts into actionable tasks and expense line-items.

### 6. Multi-Turn AI Copilot Concierge
- Embedded interactive chat assistant with active event context memory.
- Quick prompt starters for menu ideas, timeline audits, and emergency weather plans.
- Structured action buttons attached to AI messages for instant plan updates.

### 7. Executive Dossier & PDF Export
- Print-ready master brief report with executive summaries, complete budget tables, and vendor directories.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with glassmorphism, responsive CSS variables, dark/light themes, and WCAG 2.1 AA accessibility standards
- **Icons & Effects**: `lucide-react`, `canvas-confetti`
- **AI Architecture**: Dual-Engine architecture supporting **Google Gemini API** (`gemini-1.5-flash`, `gemini-2.0-flash`, `gemini-1.5-pro`) and an **Intelligent Local Generative Fallback Engine** ensuring 100% offline availability
- **Testing**: Vitest, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
```bash
npm test
```
Executes the comprehensive 29-test unit and integration test suite with Vitest.

### 4. Code Quality & Linter Verification
```bash
npm run lint
```
Executes static code analysis via Oxlint with 0 warnings and 0 errors across 114 rules.

### 5. Build for Production
```bash
npm run build
```
Executes strict TypeScript type checking (`tsc -b`) and bundles production assets with Vite.

---

## 💎 Code Quality & Enterprise Architecture

- **Automated CI/CD Pipeline**: GitHub Actions workflow (`.github/workflows/ci.yml`) validates all pull requests and pushes through automated linting, test suites, and production compilation.
- **Enterprise Fault Tolerance (`ErrorBoundary`)**: React Error Boundary isolates rendering faults, providing graceful user-facing recovery screens without corrupting saved event states in `localStorage`.
- **Zero-`any` Strict Type Safety**: End-to-end typed models across budget items, vendor CRM entities, run-of-show timeline phases, and Gemini API request/response structures.
- **Pure Utility Architecture**: Core business calculations (`calculatePercentage`, `formatDaysRemaining`, `formatCurrency`, `normalizeSearchTerm`) are decoupled into pure, testable utility functions.
- **Standards & Formatting**: Project configured with standardized `.editorconfig`, `.prettierrc`, and `.oxlintrc.json` rules ensuring developer consistency.

---

## 🔒 Security & Privacy

- **Local-First Privacy**: All party details, budgets, and vendor notes are persisted in local browser storage.
- **Zero API Key Leaks**: The Google Gemini API key is configured by the user in Settings and kept in `localStorage`. It is never committed to Git or sent to third-party tracking servers.
- **Prompt Injection Hardened**: System directives are strictly separated from user inputs in AI service calls.
- **Safe Parsing**: Multi-stage JSON extractor with regex boundary detection and safe fallbacks.

---

## 📄 License
MIT License. Created for Challenge 5: Celebration & Event Planner.
