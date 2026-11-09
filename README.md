# JDI Wealth - Client Financial Planning & Advisory System

A responsive, production-ready **Client Financial Planning and Advisory System** built in Next.js + JSX for [JDI Wealth](https://www.jdiwealth.com/).

The system provides a client-facing multi-step wizard to collect comprehensive financial data and a secure administrative suite to review, edit, and generate printable 2-page advisory reports matching the official JDI Wealth format.

---

## Key Features

1. **Client Financial Form Wizard (`/form`)**:
   - 11-step wizard: **Personal → Family → Income → Expenses → Assets → Liabilities → Investments → Financial Goals → Retirement/Pension → Additional Info → Review & Submit**.
   - Auto-centering stepper with green tick completion badges (`✓`).
   - One-click **"Fill Mock Data"** for rapid testing.
   - Comprehensive **Review Page** displaying all 10 sections of user data with direct edit links.
   - Strict validation with React Hook Form + Zod.

2. **Advisor & Admin Portal (`/adminlogin` & `/admin`)**:
   - Protected authentication with session persistence.
   - Real-time live synchronization (Zero-reload auto-updates via `BroadcastChannel`, `storage` events, and 2-second background sync).
   - KPI metrics cards: Total Submissions, Action Required, Under Review, Verified / Ready.
   - Search & workflow status filtering (`NEW`, `UNDER REVIEW`, `INFORMATION REQUIRED`, `VERIFIED`, `CALCULATING`, `REPORT READY`, `SENT`).
   - Interactive Client Profile inspection drawer.

3. **Complete Client Data Editor (`/admin/edit?id=...`)**:
   - Allows administrators to edit, add, or remove dynamic rows across all 10 sections with live recalculation of Net Worth and Surplus.

4. **Printable 2-Page Financial Report (`/admin/report?id=...`)**:
   - Replicates the exact layout, styling, and grid tables of the official JDI Wealth sample report.
   - Implements all **38 Core Financial Equations** (Future Goal Cost, SIP requirements, Step-Up projections, 19-Year Cash Flow Statement, and 30-Year Pension Plan).
   - High-contrast SVG Donut Chart for recommended monthly income distribution.
   - Pixel-perfect print styling (`@media print`) for A4 portrait printing and PDF download.

---

## Routes

| Route | Description |
|---|---|
| `/` | Redirects automatically to `/form` |
| `/form` | Client-facing financial planning data entry wizard |
| `/adminlogin` | Admin login portal (Demo: `admin@jdiwealth.com` / `admin@password123`) |
| `/admin` | Admin dashboard listing submissions with live sync |
| `/admin/edit?id=<submissionId>` | Full-page client data editor for advisors |
| `/admin/report?id=<submissionId>` | Printable 2-page client financial report with PDF download |

---

## Deployment on Vercel

### Method 1: Deploy via GitHub (Recommended)

1. **Commit and Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete JDI Wealth financial planning and report system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Sign in with your GitHub account.
   - Click **Import** next to your repository.

3. **Configure Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (or `next build --webpack`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Click Deploy**:
   - Vercel will install dependencies, build the Next.js application, and generate your live production URL (e.g., `https://your-project.vercel.app`).

---

### Method 2: Deploy via Vercel CLI

1. **Run the Vercel Deploy Command**:
   ```bash
   npx vercel
   ```
2. Follow the terminal prompts:
   - **Set up and deploy?**: `y`
   - **Which scope?**: Select your personal or team account
   - **Link to existing project?**: `n`
   - **What's your project's name?**: `jdi-wealth-financial-planner`
   - **In which directory is your code located?**: `./`
   - **Want to modify build settings?**: `n`
3. For production deployment:
   ```bash
   npx vercel --prod
   ```

---

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run production build check
npm run build
```
Open [http://localhost:3000](http://localhost:3000) to view the application.
