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

### 🔐 Login
> Clean, minimal authentication page with soft gradient background

<p align="center">
  <img src="traveltrack/public/screenshots/login.png" width="800" alt="Login Page"/>
</p>

### 📊 Dashboard
> Travel overview with stats, smart insights, currency converter, and quick actions

<p align="center">
  <img src="traveltrack/public/screenshots/dashboard.png" width="800" alt="Dashboard"/>
</p>

### 🗺️ Trips
> Grid view with search, status filters, and budget progress bars

<p align="center">
  <img src="traveltrack/public/screenshots/trips.png" width="800" alt="Trips Page"/>
</p>

### 💰 Expenses
> Full expense list with category icons, multi-currency, and PDF export

<p align="center">
  <img src="traveltrack/public/screenshots/expenses.png" width="800" alt="Expenses Page"/>
</p>

### 📈 Analytics
> Pie charts, bar charts, area trends, and spending breakdowns

<p align="center">
  <img src="traveltrack/public/screenshots/analytics.png" width="800" alt="Analytics Page"/>
</p>

### ⚙️ Settings
> Profile, currency, notifications, and data export options

<p align="center">
  <img src="traveltrack/public/screenshots/settings.png" width="800" alt="Settings Page"/>
</p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQLite via [Prisma 7](https://www.prisma.io/) + LibSQL ([Turso](https://turso.tech/)-compatible) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) v4 (Credentials + JWT) |
| **Charts** | [Recharts](https://recharts.org/) |
| **PDF** | [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) via `next/font/google` |

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        Browser["Browser"]
        Pages["Next.js Pages<br/>(React Server Components)"]
        Components["Shared Components<br/>(CurrencyConverter, QuickExpense)"]
    end

    subgraph AppRouter["⚡ Next.js App Router"]
        AuthGroup["(auth) Route Group<br/>Login / Register"]
        DashGroup["(dashboard) Route Group<br/>Dashboard / Trips / Expenses<br/>Analytics / Settings"]
        Middleware["Session Middleware<br/>(NextAuth JWT)"]
    end

    subgraph API["📡 REST API Layer"]
        AuthAPI["Auth API<br/>POST /api/auth/register<br/>POST /api/auth/[...nextauth]"]
        TripsAPI["Trips API<br/>GET/POST /api/trips<br/>GET/PUT/DELETE /api/trips/[id]<br/>POST /api/trips/[id]/budget<br/>GET/POST /api/trips/[id]/itinerary"]
        ExpensesAPI["Expenses API<br/>GET/POST /api/expenses<br/>DELETE /api/expenses/[id]"]
    end

    subgraph Services["🔧 Service Layer (lib/)"]
        AuthLib["auth.ts<br/>NextAuth Config"]
        Validation["validations.ts<br/>Zod Schemas"]
        Currency["currency.ts<br/>Exchange Rates"]
        PDFExport["pdf-export.ts<br/>Report Generation"]
        DataExport["data-export.ts<br/>CSV & JSON Export"]
        Utils["utils.ts<br/>Formatters & Constants"]
    end

    subgraph Data["🗄️ Data Layer"]
        PrismaClient["Prisma ORM Client"]
        SQLite["SQLite / Turso<br/>(LibSQL)"]
    end

    Browser --> Pages
    Pages --> Components
    Pages --> AuthGroup
    Pages --> DashGroup
    AuthGroup --> Middleware
    DashGroup --> Middleware
    Middleware --> AuthAPI
    DashGroup --> TripsAPI
    DashGroup --> ExpensesAPI
    AuthAPI --> AuthLib
    TripsAPI --> Validation
    ExpensesAPI --> Validation
    TripsAPI --> PrismaClient
    ExpensesAPI --> PrismaClient
    AuthAPI --> PrismaClient
    DashGroup --> Currency
    DashGroup --> PDFExport
    DashGroup --> DataExport
    DashGroup --> Utils
    PrismaClient --> SQLite

    style Client fill:#eef2ff,stroke:#4f46e5
    style AppRouter fill:#f0fdf4,stroke:#16a34a
    style API fill:#fef3c7,stroke:#d97706
    style Services fill:#fdf2f8,stroke:#db2777
    style Data fill:#f1f5f9,stroke:#475569
```

### Data Model Relationships

```mermaid
erDiagram
    User ||--o{ Trip : creates
    User ||--o{ Expense : logs
    Trip ||--o| Budget : has
    Trip ||--o{ Expense : contains
    Trip ||--o{ ItineraryItem : plans
    Budget ||--o{ CategoryBudget : allocates

    User {
        string id PK
        string email UK
        string name
        string passwordHash
        string defaultCurrency
    }
    Trip {
        string id PK
        string userId FK
        string name
        string destination
        datetime startDate
        datetime endDate
        string purpose
        string status
    }
    Expense {
        string id PK
        string tripId FK
        string userId FK
        float amount
        string currency
        string category
        string merchant
        string paymentMethod
    }
    Budget {
        string id PK
        string tripId FK
        float totalBudget
        float dailyLimit
        string currency
    }
    CategoryBudget {
        string id PK
        string budgetId FK
        string category
        float allocated
    }
    ItineraryItem {
        string id PK
        string tripId FK
        string title
        string location
        float estimatedCost
        int duration
    }
    ExchangeRate {
        string id PK
        string fromCurrency
        string toCurrency
        float rate
    }
```

---

## 🔄 Application Workflow

```mermaid
flowchart TD
    Start([User Opens App]) --> AuthCheck{Authenticated?}

    AuthCheck -- No --> LoginPage["🔐 Login / Register Page"]
    LoginPage --> Credentials["Enter Email & Password"]
    Credentials --> AuthAPI["NextAuth API<br/>Validate & Issue JWT"]
    AuthAPI --> AuthCheck

    AuthCheck -- Yes --> Dashboard["📊 Dashboard"]

    Dashboard --> Action{User Action}

    Action --> CreateTrip["🗺️ Create New Trip"]
    Action --> ViewTrips["📋 View All Trips"]
    Action --> QuickExp["⚡ Quick Add Expense"]
    Action --> Analytics["📈 View Analytics"]
    Action --> Settings["⚙️ Settings"]
    Action --> Convert["💱 Currency Converter"]

    CreateTrip --> TripForm["Fill Trip Details<br/>(Name, Destination, Dates, Purpose)"]
    TripForm --> SaveTrip["POST /api/trips"]
    SaveTrip --> TripDetail["📄 Trip Detail Page"]

    ViewTrips --> TripList["Browse & Filter Trips"]
    TripList --> TripDetail

    TripDetail --> TripActions{Trip Actions}
    TripActions --> AddExpense["💰 Add Expense<br/>(Amount, Category, Merchant)"]
    TripActions --> SetBudget["📊 Set Budget<br/>(Total, Daily Limit, Categories)"]
    TripActions --> PlanItinerary["📅 Plan Itinerary<br/>(Activities, Times, Locations)"]
    TripActions --> ExportPDF["📄 Export PDF Report"]

    AddExpense --> SaveExpense["POST /api/expenses"]
    SaveExpense --> TripDetail

    SetBudget --> SaveBudget["POST /api/trips/[id]/budget"]
    SaveBudget --> TripDetail

    PlanItinerary --> SaveItinerary["POST /api/trips/[id]/itinerary"]
    SaveItinerary --> TripDetail

    ExportPDF --> GeneratePDF["Generate PDF with jsPDF"]
    GeneratePDF --> Download["⬇️ Download Report"]

    QuickExp --> QuickForm["Floating Modal<br/>(Select Trip, Amount, Category)"]
    QuickForm --> SaveExpense

    Analytics --> Charts["View Charts<br/>(Pie, Bar, Area, Rankings)"]

    Settings --> SettingsActions{Settings Actions}
    SettingsActions --> Profile["Update Profile & Currency"]
    SettingsActions --> ExportData["Export All Data<br/>(CSV / JSON)"]

    style Start fill:#4f46e5,color:#fff
    style Dashboard fill:#eef2ff,stroke:#4f46e5
    style LoginPage fill:#fef2f2,stroke:#ef4444
    style TripDetail fill:#f0fdf4,stroke:#16a34a
    style Analytics fill:#fdf2f8,stroke:#db2777
    style Download fill:#fef3c7,stroke:#d97706
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Local Development

```bash
# Clone the repository
git clone https://github.com/rajdivyansh965/TravelTrack.git
cd TravelTrack/traveltrack

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
# Local development (SQLite file)
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Production / Vercel (Turso cloud database)
# TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
# TURSO_AUTH_TOKEN="your-turso-auth-token"
```

### Deploy to Vercel

This project uses **[Turso](https://turso.tech/)** (LibSQL) for production — a cloud-hosted SQLite-compatible database.

```bash
# 1. Install Turso CLI & create a database
brew install tursodatabase/tap/turso
turso auth login
turso db create traveltrack

# 2. Get your credentials
turso db show traveltrack --url       # Copy the URL
turso db tokens create traveltrack    # Copy the token

# 3. Push schema to Turso
export TURSO_DATABASE_URL="libsql://..."
export TURSO_AUTH_TOKEN="..."
npx prisma db push

# 4. Set env vars in Vercel Dashboard → Settings → Environment Variables
# Then deploy via git push
```

| Variable | Value |
|---|---|
| `TURSO_DATABASE_URL` | `libsql://traveltrack-your-username.turso.io` |
| `TURSO_AUTH_TOKEN` | Your Turso auth token |
| `DATABASE_URL` | Same as `TURSO_DATABASE_URL` |
| `NEXTAUTH_SECRET` | A strong random key (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

---

## 📂 Project Structure

```
traveltrack/
├── prisma/
│   ├── schema.prisma        # Database schema (SQLite)
│   └── seed.ts              # Demo data seeder
├── prisma.config.ts         # Prisma config (Turso URL)
├── public/
│   └── screenshots/         # App screenshots for README
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   ├── (dashboard)/      # Dashboard, Trips, Expenses, Analytics, Settings
│   │   └── api/              # REST API routes
│   ├── components/           # Reusable UI components
│   │   ├── CurrencyConverter.tsx
│   │   ├── QuickExpense.tsx
│   │   └── providers.tsx
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── currency.ts       # Currency data & rates
│   │   ├── data-export.ts    # CSV & JSON export
│   │   ├── pdf-export.ts     # PDF report generation
│   │   ├── prisma.ts         # Database client (LibSQL adapter)
│   │   ├── utils.ts          # Formatting & constants
│   │   └── validations.ts    # Zod schemas
│   └── types/
│       └── next-auth.d.ts    # Session type augmentation
├── .env                      # Environment variables
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

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and ☕
</p>
