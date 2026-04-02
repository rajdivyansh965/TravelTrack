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
  <img src="https://img.shields.io/badge/Mongoose-8-880000?style=flat-square&logo=mongodb" alt="Mongoose"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"/>
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
  <img src="public/screenshots/login.png" width="800" alt="Login Page"/>
</p>

### 📊 Dashboard
> Travel overview with stats, smart insights, currency converter, and quick actions

<p align="center">
  <img src="public/screenshots/dashboard.png" width="800" alt="Dashboard"/>
</p>

### 🗺️ Trips
> Grid view with search, status filters, and budget progress bars

<p align="center">
  <img src="public/screenshots/trips.png" width="800" alt="Trips Page"/>
</p>

### 💰 Expenses
> Full expense list with category icons, multi-currency, and PDF export

<p align="center">
  <img src="public/screenshots/expenses.png" width="800" alt="Expenses Page"/>
</p>

### 📈 Analytics
> Pie charts, bar charts, area trends, and spending breakdowns

<p align="center">
  <img src="public/screenshots/analytics.png" width="800" alt="Analytics Page"/>
</p>

### ⚙️ Settings
> Profile, currency, notifications, and data export options

<p align="center">
  <img src="public/screenshots/settings.png" width="800" alt="Settings Page"/>
</p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) via [Mongoose 8](https://mongoosejs.com/) |
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
    subgraph Client["🖥️ CLIENT LAYER"]
        Browser["🌐 Browser"]
        Pages["📄 Next.js Pages"]
        Components["🧩 Shared Components"]
    end

    subgraph AppRouter["⚡ NEXT.JS APP ROUTER"]
        AuthGroup["🔐 Auth Routes"]
        DashGroup["📊 Dashboard Routes"]
        Middleware["🛡️ Session Middleware"]
    end

    subgraph API["📡 REST API LAYER"]
        AuthAPI["👤 Auth API"]
        TripsAPI["✈️ Trips API"]
        ExpensesAPI["💰 Expenses API"]
    end

    subgraph Services["🔧 SERVICE LAYER"]
        AuthLib["🔑 Auth Config"]
        Validation["✅ Zod Validation"]
        Currency["💱 Exchange Rates"]
        PDFExport["📄 PDF Reports"]
        DataExport["📦 CSV / JSON Export"]
        Utils["🛠️ Utilities"]
    end

    subgraph Data["🗄️ DATA LAYER"]
        MongooseODM["🍃 Mongoose ODM"]
        MongoDB["🍃 MongoDB Atlas"]
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
    TripsAPI --> MongooseODM
    ExpensesAPI --> MongooseODM
    AuthAPI --> MongooseODM
    DashGroup --> Currency
    DashGroup --> PDFExport
    DashGroup --> DataExport
    DashGroup --> Utils
    MongooseODM --> MongoDB

    style Client fill:#eef2ff,stroke:#4f46e5,color:#1e1b4b
    style AppRouter fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style API fill:#fef3c7,stroke:#d97706,color:#78350f
    style Services fill:#fdf2f8,stroke:#db2777,color:#831843
    style Data fill:#f1f5f9,stroke:#475569,color:#0f172a
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
        ObjectId _id PK
        string email UK
        string name
        string passwordHash
        string defaultCurrency
    }
    Trip {
        ObjectId _id PK
        ObjectId userId FK
        string name
        string destination
        datetime startDate
        datetime endDate
        string purpose
        string status
    }
    Expense {
        ObjectId _id PK
        ObjectId tripId FK
        ObjectId userId FK
        float amount
        string currency
        string category
        string merchant
        string paymentMethod
    }
    Budget {
        ObjectId _id PK
        ObjectId tripId FK
        float totalBudget
        float dailyLimit
        string currency
    }
    CategoryBudget {
        ObjectId _id PK
        string category
        float allocated
    }
    ItineraryItem {
        ObjectId _id PK
        ObjectId tripId FK
        string title
        string location
        float estimatedCost
        int duration
    }
    ExchangeRate {
        ObjectId _id PK
        string fromCurrency
        string toCurrency
        float rate
    }
```

---

## 🔄 Application Workflow

```mermaid
flowchart TD
    Start(["🚀 User Opens App"]) --> AuthCheck{"🔒 Authenticated?"}

    AuthCheck -- No --> LoginPage["🔐 Login / Register"]
    LoginPage --> Credentials["📝 Enter Credentials"]
    Credentials --> AuthValidate["✅ Validate & Issue JWT"]
    AuthValidate --> AuthCheck

    AuthCheck -- Yes --> Dashboard["📊 Dashboard"]

    Dashboard --> Action{"🎯 User Action"}

    Action --> CreateTrip["🗺️ Create Trip"]
    Action --> ViewTrips["📋 View Trips"]
    Action --> QuickExp["⚡ Quick Expense"]
    Action --> Analytics["📈 Analytics"]
    Action --> Settings["⚙️ Settings"]
    Action --> Convert["💱 Convert Currency"]

    CreateTrip --> TripForm["📝 Trip Details Form"]
    TripForm --> SaveTrip["💾 Save Trip"]
    SaveTrip --> TripDetail["📄 Trip Detail"]

    ViewTrips --> TripList["🔍 Browse & Filter"]
    TripList --> TripDetail

    TripDetail --> TripActions{"⚡ Trip Actions"}
    TripActions --> AddExpense["💰 Add Expense"]
    TripActions --> SetBudget["📊 Set Budget"]
    TripActions --> PlanItinerary["📅 Plan Itinerary"]
    TripActions --> ExportPDF["📄 Export PDF"]

    AddExpense --> SaveExpense["💾 Save Expense"]
    SaveExpense --> TripDetail

    SetBudget --> SaveBudget["💾 Save Budget"]
    SaveBudget --> TripDetail

    PlanItinerary --> SaveItinerary["💾 Save Itinerary"]
    SaveItinerary --> TripDetail

    ExportPDF --> GeneratePDF["⚙️ Generate PDF"]
    GeneratePDF --> Download["⬇️ Download"]

    QuickExp --> QuickForm["📝 Quick Entry Modal"]
    QuickForm --> SaveExpense

    Analytics --> Charts["📊 Interactive Charts"]

    Settings --> SettingsActions{"⚙️ Settings"}
    SettingsActions --> Profile["👤 Update Profile"]
    SettingsActions --> ExportData["📦 Export Data"]

    style Start fill:#4f46e5,color:#ffffff
    style Dashboard fill:#eef2ff,stroke:#4f46e5,color:#1e1b4b
    style LoginPage fill:#fef2f2,stroke:#ef4444,color:#7f1d1d
    style TripDetail fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style Analytics fill:#fdf2f8,stroke:#db2777,color:#831843
    style Download fill:#fef3c7,stroke:#d97706,color:#78350f
    style Action fill:#f5f3ff,stroke:#7c3aed,color:#4c1d95
    style TripActions fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style AuthCheck fill:#fef2f2,stroke:#ef4444,color:#7f1d1d
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

# Seed demo data
npm run seed

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
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/traveltrack?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Deploy to Vercel

This project uses **[MongoDB Atlas](https://www.mongodb.com/atlas)** (free tier) for production.

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and allow network access from `0.0.0.0/0`
3. Get your connection string (Drivers → Node.js)
4. Set env vars in **Vercel → Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `DATABASE_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/traveltrack` |
| `NEXTAUTH_SECRET` | A strong random key (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |

---

## 📂 Project Structure

```
traveltrack/
├── scripts/
│   └── seed.ts              # Demo data seeder (Mongoose)
├── public/
│   └── screenshots/         # App screenshots for README
├── src/
│   ├── app/
│   │   ├── (auth)/           # Login & Register pages
│   │   ├── (dashboard)/      # Dashboard, Trips, Expenses, Analytics, Settings
│   │   └── api/              # REST API routes
│   ├── components/           # Reusable UI components
│   ├── lib/
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Mongoose connection utility
│   │   ├── models/           # Mongoose schemas & models
│   │   ├── utils.ts          # Formatting & constants
│   │   └── validations.ts    # Zod schemas
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
