<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/airplane-take-off.png" width="80" alt="TravelTrack Logo"/>
</p>

<h1 align="center">TravelTrack</h1>

<p align="center">
  <strong>Your all-in-one travel & expense management companion</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/Features-5%2B-4f46e5?style=flat-square" alt="Features"/></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma" alt="Prisma"/>
</p>

<p align="center">
  Plan trips · Track expenses · Manage budgets · Analyze spending — all in one place.
</p>

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗺️ **Trip Management** | Create, edit, and manage trips with destination, dates, purpose, and notes |
| 💰 **Expense Tracking** | Log expenses with category, merchant, payment method, and multi-currency support |
| 📊 **Budget Monitoring** | Set trip budgets with per-category allocations and real-time progress tracking |
| 📅 **Itinerary Planner** | Plan daily activities with time, location, duration, and estimated costs |
| 📈 **Analytics Dashboard** | Interactive charts — spending by category, daily trends, trip comparisons, top merchants |
| 💱 **Currency Converter** | Quick-access currency converter with 24+ currencies on the dashboard |
| ⚡ **Quick Expense** | Floating action button for rapid expense entry from any page |
| 🧠 **Smart Insights** | Automated spending analysis — top category, avg per trip, budget utilization |
| 📄 **PDF Export** | Professional expense reports with summary, category breakdown, and full table |
| 📦 **CSV & JSON Export** | Download your data for backup or import into other tools |
| 🔐 **Authentication** | Secure login/register with hashed passwords and JWT sessions |

---

## 🖼️ Screenshots

<details>
<summary>Click to expand screenshots</summary>
<br>

> **Login** — Clean, minimal authentication page with soft gradient background

> **Dashboard** — Travel overview with stats, smart insights, currency converter, and quick actions

> **Trips** — Grid view with search, status filters, budget progress bars

> **Trip Detail** — Tabbed view (Overview, Expenses, Itinerary, Budget) with PDF export

> **Analytics** — Pie charts, bar charts, area trends, and top merchant rankings

> **Settings** — Profile, currency, notifications, and data export options

</details>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite via [Prisma 7](https://www.prisma.io/) + better-sqlite3 |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) v4 (Credentials + JWT) |
| **Charts** | [Recharts](https://recharts.org/) |
| **PDF** | [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/traveltrack.git
cd traveltrack

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables below)

# Initialize the database
npx prisma generate
npx prisma db push

# Seed demo data
npx prisma db seed

# Start the development server
npm run dev
```

Open **http://localhost:3000** and sign in with the demo account:

| | |
|---|---|
| **Email** | `demo@traveltrack.app` |
| **Password** | `demo1234` |

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 📂 Project Structure

```
traveltrack/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts               # Demo data seeder
├── src/
│   ├── app/
│   │   ├── (auth)/            # Login & Register pages
│   │   ├── (dashboard)/       # Dashboard, Trips, Expenses, Analytics, Settings
│   │   └── api/               # REST API routes
│   ├── components/            # Reusable UI components
│   │   ├── CurrencyConverter.tsx
│   │   └── QuickExpense.tsx
│   └── lib/
│       ├── utils.ts           # Formatting & constants
│       ├── currency.ts        # Currency data & rates
│       ├── pdf-export.ts      # PDF report generation
│       ├── data-export.ts     # CSV & JSON export
│       ├── validations.ts     # Zod schemas
│       ├── prisma.ts          # Database client
│       └── auth.ts            # NextAuth configuration
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

---

## 📡 API Routes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/[...nextauth]` | Authentication (login/logout) |
| `GET/POST` | `/api/trips` | List all trips / Create trip |
| `GET/PUT/DELETE` | `/api/trips/[id]` | Get / Update / Delete trip |
| `POST` | `/api/trips/[id]/budget` | Set trip budget |
| `GET/POST` | `/api/trips/[id]/itinerary` | Manage itinerary items |
| `GET/POST` | `/api/expenses` | List / Create expenses |
| `DELETE` | `/api/expenses/[id]` | Delete expense |

---

## 🧪 Build & Test

```bash
# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## 🎨 Design Philosophy

TravelTrack follows a **minimalistic design** approach:

- 🤍 Light, airy backgrounds with white cards and subtle shadows
- 💜 Indigo accent color (`#4f46e5`) for consistency
- 📐 Generous whitespace and clean typography (Inter)
- 🎭 Subtle fade/slide-in animations for polish
- 📱 Fully responsive — sidebar (desktop) + bottom tabs (mobile)

---

<p align="center">
  Made with ❤️ and ☕
</p>
