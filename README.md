# 🗂️ Mini CRM — Client Lead Management System

A full-stack CRM system built with React, Node.js, Express, and MongoDB. Manage leads, track statuses, add follow-up notes, and view analytics — all from a secure admin dashboard.

## ✨ Features

- 🔐 **Secure Admin Login** — JWT authentication, one-time setup
- 👥 **Lead Management** — Add, edit, delete, and search leads
- 🔄 **Status Pipeline** — New → Contacted → Qualified → Converted → Lost
- 📝 **Follow-up Notes** — Add timestamped notes to every lead
- 📊 **Analytics Dashboard** — Charts for status, source, conversion rate
- 🔍 **Search & Filter** — Filter by status, source, priority
- 📱 **Responsive** — Works on mobile and desktop

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt |
| Deployment | Vercel (frontend + backend) |

## 📁 Project Structure

```
mini-crm/
├── backend/
│   ├── models/        # Lead.js, User.js
│   ├── routes/        # auth.js, leads.js, analytics.js
│   ├── middleware/    # auth.js (JWT protect)
│   └── server.js
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/  # Layout, LeadModal
│       ├── context/     # AuthContext
│       ├── pages/       # Dashboard, Leads, LeadDetail, Login, Setup
│       └── services/    # api.js (axios)
├── vercel.json
├── .env.example
└── README.md
```

## ⚙️ Local Setup

### Prerequisites
- Node.js ≥ 16
- MongoDB Atlas account (free tier works)

### Step 1 — Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/mini-crm.git
cd mini-crm
npm install
cd frontend && npm install && cd ..
```

### Step 2 — Create `.env` in root

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/minicrm
JWT_SECRET=your_random_secret_key_min_32_characters
PORT=5000
NODE_ENV=development
```

### Step 3 — Run locally

```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd frontend && npm start
```

Frontend: http://localhost:3000  
Backend API: http://localhost:5000/api

### Step 4 — First login

Visit http://localhost:3000/setup to create your admin account (only works once).

## 🚀 Deploy to Vercel

### Step 1 — MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Free tier
2. Create cluster → Get connection string
3. Add `0.0.0.0/0` to Network Access (allow all IPs for Vercel)

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "🚀 Initial Mini CRM"
git remote add origin https://github.com/YOUR_USERNAME/mini-crm.git
git push -u origin main
```

### Step 3 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub
3. Set **Root Directory** to `/` (leave default)
4. Add Environment Variables:

| Key | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | A random 32+ char string |
| `NODE_ENV` | `production` |
| `REACT_APP_API_URL` | Leave blank (uses same domain) |

5. Click **Deploy** ✅

### Step 4 — Create admin account

Visit `https://your-app.vercel.app/setup` → Create admin → Done!

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/setup` | Create first admin |
| POST | `/api/auth/login` | Login → get JWT |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/leads` | List leads (filter/search/page) |
| POST | `/api/leads` | Create lead |
| GET | `/api/leads/:id` | Get single lead |
| PUT | `/api/leads/:id` | Update lead |
| DELETE | `/api/leads/:id` | Delete lead |
| POST | `/api/leads/:id/notes` | Add note |
| DELETE | `/api/leads/:id/notes/:noteId` | Delete note |
| GET | `/api/analytics` | Get dashboard stats |

## 📄 License

MIT — free to use and extend.

---

*Built as Task 2 of Future Interns Full Stack Web Development Internship 2026*
