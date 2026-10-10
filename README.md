# ZeroWaste AI — Shelf-Life Intelligence & Planner Dashboard

Agentic AI Perishable Demand & Shelf-Life Management for simulated grocery store networks.

## Features
- **Global App Shell & Live Simulation**: Real-time tick engine (`#4,289`), facility selector across store network (`Store A`, `Store B`, `Store C`, `All Stores`), active window filters, and simulation clock toggle.
- **3-Tier Role-Based Access Control (RBAC)**:
  - `User` (Customer / Store Staff): Read-only fresh batch catalog with sustainability and shelf-life impact indicators.
  - `Retail Store Owner` (Store Manager): Scoped to local store batch inventory, urgent expiry alerts (< 3 days), local stockouts, and markdown/replenishment reviews.
  - `Admin` (Lead Supply Chain & Network Planner): Unrestricted access to inter-store transfer proposals, ML forecast models vs 7-day Moving Average baselines, and financial impact metrics.
- **Planner Overview Metrics**: High-contrast KPI cards (Total Available Units, Nearing Expiry <3d, Est. At-Risk Spoilage, Predicted Stockouts, and Pending Actions).
- **Interactive Visualizations (Recharts)**:
  - Short-Term Demand vs. Historical Sales 7-day rolling window with baseline MA toggle and 95% confidence intervals.
  - Spoilage Risk Distribution Donut chart across Dairy, Produce, Bakery, and Meat & Poultry.
- **Action Review Center (Human-in-the-Loop)**:
  - Algorithmic proposals for `MARKDOWN`, `INTER-STORE TRANSFER`, and `REPLENISHMENT`.
  - Interactive decision modals with mandatory compliance logging for modifications and rejections.
- **Relational Batch-Level Inventory**: Explicit per-batch shelf tracking with real expiry timestamps, days remaining, storage temperature, and lot tracking.
- **Inter-Store Balancing Matrix**: Donor surplus vs recipient deficit balancing, transit duration, degradation risk, and dispatch controls.
- **Evaluation & Impact Benchmarks**: Rigorous comparison showing WAPE reduction (14.2% -> 4.8%), waste prevention, and financial savings.

---

## Local Development Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Local Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build & Verify Production Bundle**:
   ```bash
   npm run build
   ```

---

## Deployment Guide (1-Click Public Link on Vercel)

Deploy instantly to Vercel so teammates and evaluators can test the live dashboard:

1. **Via Vercel CLI**:
   ```bash
   npx vercel
   ```
   Follow the interactive prompts to deploy directly.

2. **Via GitHub Import**:
   - Push this repository to GitHub.
   - Go to [Vercel](https://vercel.com/new).
   - Import your repository. Vercel automatically detects Vite/React configuration with build command `npm run build` and output directory `dist`.
   - Click **Deploy**.
