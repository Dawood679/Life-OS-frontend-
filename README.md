# 🖥️ LifeOS Frontend Client

Modern, responsive glassmorphic web interface for **LifeOS**, built with React 19, Vite, TailwindCSS (v4), React Router DOM (v7), Zustand, Google Identity Services, and Stripe Checkout.

---

## 🛠️ Tech Stack & Key Libraries

* **Framework**: React 19 (Functional Components, Custom Hooks)
* **Build Tooling**: Vite
* **Styling**: TailwindCSS (v4) with custom glassmorphism design tokens & dark/light palettes
* **State Management**: Zustand
* **Routing**: React Router DOM (v7)
* **Icons**: Lucide React
* **Feedback**: React Hot Toast
* **Auth**: Google Identity Services (GIS SDK client — zero external npm dependencies)
* **Payments**: Stripe Hosted Checkout (`/api/payments/create-checkout-session`)
* **Speech Integration**: Browser Web Speech API (`webkitSpeechRecognition` & `speechSynthesis`)

---

## 🔑 Environment Setup

Create a `.env` file in `Life-OS-frontend-/`:

```env
VITE_BACKEND_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### Google OAuth Configuration Notice
When setting up your Google Cloud Console OAuth 2.0 Client ID:
* Add `http://localhost:5173` and `http://localhost` to **Authorized JavaScript origins**.
* No Authorized Redirect URIs are needed because LifeOS uses the client-side Google Identity Services popup token flow (`googleAuth.js`).

---

## 📁 Key Directory Structure

```
src/
├── components/
│   ├── landing/              # Hero, About, BentoGrid, 3-Card PricingSection, CTA, Footer
│   ├── AIAssistantDashboard.jsx # Central hub with Life Score, Daily Briefing & Pro Tier Indicator
│   ├── Sidebar.jsx           # Global navigation with Pro Monthly / Pro Yearly VIP badges
│   ├── Navbar.jsx            # Landing navigation (Home, Pricing, About, Login/Dashboard)
│   ├── MockInterviewStudio.jsx # Turn-by-turn voice/text interview simulator
│   ├── JobApplicationTracker.jsx # 5-Stage Kanban & 16-Col Excel view
│   ├── RoadmapGenerator.jsx  # 90-Day Career Transformation Engine
│   └── ...
├── lib/
│   ├── axios.js              # Central Axios instance with credentials
│   └── googleAuth.js         # Zero-dependency Google Identity Services (GIS) token client
├── store/
│   ├── authStore.js          # Zustand user authentication & session state
│   └── ...
├── App.jsx                   # Route provider & protected layouts
└── main.jsx                  # Application root
```

---

## 💳 Pricing & Subscriptions

* **Starter ($0 / Free Forever)**: Daily habit tracking, basic AI study planner, and wellness logger.
* **Monthly ($19/month)**: Full autonomous AI suite billed on a monthly recurring subscription.
* **Yearly ($180 one-time)**: 1-Year (365 days) full access pass with zero recurring billing surprises.

### Dynamic User Tier Badges:
* Active Monthly Subscriber: **`⚡ PRO MONTHLY (ACTIVE)`**
* Active Annual Pass Holder: **`👑 PRO YEARLY (365d ACTIVE)`**
* Starter Plan Member: **`⚡ Starter Plan • Upgrade to Pro ➔`**

---

## 🚀 Running the Frontend

```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
