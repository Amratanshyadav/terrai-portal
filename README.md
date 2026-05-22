# 🌲 Terrai — Operational Control Center & Digital Ledger

Welcome to **Terrai**, a sleek, high-performance, and distraction-free operational digital ledger. Restructured and rebranded from the legacy Shri Krishna Construction Portal, **Terrai** is optimized for raw speed, utility, and visual excellence on mining site locations.

All complex telemetry, AI-chats, and warehouse stocks have been pruned, leaving three high-impact, mobile-friendly modules for on-site managers and security supervisors.

---

## ⚡ Key Modules

1. **👥 Employees & Payments Directory**
   * **Employees Roster**: Single-name workforce directory tracking phone numbers, job roles/posts, and monthly base salaries.
   * **Payments Ledger**: Accurate historical cash advances and salary payments ledger recorded in native Indian Rupees (`₹`).

2. **🚛 Vehicle Movement Logs**
   * **Real-time Tracker**: Active on-site tracking of vehicles with automated driver loggers.
   * **One-Click Check-Out**: Quick dispatch logging with duration calculations and historical logs.

3. **⛽ Diesel Fuel Logs**
   * **Fuel Ledger**: Detailed dispatch tracking including liters, cost in `₹`, dispatcher name, and timestamps.
   * **Quick Metrics**: Instant aggregate stats showing total liters issued and cumulative expenditures.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js (TypeScript, modern dark-zinc UI, HSL theme colors, Lucide icons, responsive navigation).
* **Backend**: Node.js & Express (TypeScript, REST API Architecture).
* **Database**: MongoDB (Mongoose schemas, optimized first-name-only indexes).

---

## 🚀 Quick Launch Guide

Follow these steps to run the application locally on your Windows environment:

### Step 1: Initialize the Database (Seeding)
Reset your database and seed it with clean, simplified operational datasets:
```powershell
cd backend
npm run seed
```

### Step 2: Launch the Servers
We have included a customized batch file in the root of the project to run both servers simultaneously. 

Simply **double-click** on:
👉 `Launch_Portal.bat`

*Alternatively, you can start them manually in separate terminal windows:*
* **Backend API Gateway (`http://localhost:5000`)**:
  ```powershell
  cd backend
  npm run dev
  ```
* **Next.js Frontend Client (`http://localhost:3000`)**:
  ```powershell
  cd frontend
  npm run dev
  ```

---

## 🔐 Secure Gateway Login

Access the secure portal at `http://localhost:3000/login` using your configured manager/supervisor credentials.

*(Refer to your database seeder or local environment configuration for secure credentials.)*

---

## 📁 Repository Structure

```
├── frontend/               # Next.js client-side application
├── backend/                # Express rest API gateway
├── Launch_Portal.bat       # Windows automation batch launcher
├── .gitignore              # Ignored files (node_modules, next, .env)
└── README.md               # You are here!
```

---

## 🌐 Cloud Deployment (Railway)

If you want the portal to run online 24/7 so that anyone can access it from their mobile phone anywhere in the world (even when your laptop is turned off), you can deploy it to **Railway.app** in 3 simple clicks:

### Step 1: Link your Repository on Railway
1. Go to [Railway.app](https://railway.app) and sign up/log in with your GitHub account.
2. Click **New Project** > **Deploy from GitHub repository** > Select your **`terrai-portal`** repository.

### Step 2: Add MongoDB Database (Inside Railway)
1. On your Railway dashboard project canvas, click **New** > **Database** > **MongoDB**.
2. Railway will instantly spin up a local private MongoDB cluster for you.
3. Click on the MongoDB service on the canvas, go to the **Variables** tab, and copy the `MONGODB_URL` variable.

### Step 3: Configure and Launch Services

#### A. Configure Backend:
1. Click **New** > **GitHub Repo** > Select `terrai-portal`.
2. Under **Settings** > **General**, set **Root Directory** to `backend`.
3. Go to the **Variables** tab, and add:
   * `PORT` = `5000`
   * `NODE_ENV` = `production`
   * `MONGO_URI` = `${{MONGODB_URL}}` *(This automatically links your Railway MongoDB)*
   * `JWT_ACCESS_SECRET` = `your_own_custom_secret_key`
   * `JWT_REFRESH_SECRET` = `your_own_custom_refresh_key`
4. Railway will automatically build and launch your backend using the backend Dockerfile. Copy your backend service's public URL (e.g. `https://terrai-backend.up.railway.app`).

#### B. Configure Frontend:
1. Click **New** > **GitHub Repo** > Select `terrai-portal` again.
2. Under **Settings** > **General**, set **Root Directory** to `frontend`.
3. Go to the **Variables** tab, and add:
   * `NEXT_PUBLIC_API_URL` = `https://your-backend-url.up.railway.app/api/v1` *(Use the backend URL from the previous step)*
   * `NEXT_PUBLIC_SOCKET_URL` = `https://your-backend-url.up.railway.app`
4. Railway will automatically compile your Next.js frontend and provide a global public web URL (e.g. `https://terrai-frontend.up.railway.app`).

**🎉 You are all set! Share the frontend link with your supervisors and staff to access the Terrai portal from any device, anywhere in the world!**

---
*Developed with premium aesthetics and extreme simplicity for **Terrai** operations.*
