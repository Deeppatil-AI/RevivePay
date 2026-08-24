# 🚀 RevivePay Deployment & Production Setup Guide

This guide details how to deploy **RevivePay Sentinel** to cloud platforms (Render, Railway, Fly.io, Vercel, Docker) with full persistence and production security.

---

## 🐳 Option 1: Docker One-Command Deployment (Recommended)

RevivePay includes pre-configured Dockerfiles and Compose stacks for standalone and production hosting.

### 1. Build and Run Container
```bash
# Production Container (Builds Vite SPA and serves via Express Backend on port 5000)
docker compose up --build -d
```

### 2. Verify Container Health
```bash
curl http://localhost:5000/api/health
```

---

## ☁️ Option 2: Render.com One-Click Web Service

1. **New Web Service**: Connect your GitHub repository (`https://github.com/Deeppatil-AI/RevivePay`).
2. **Environment**: `Node`
3. **Build Command**:
   ```bash
   npm install && npm run build
   ```
4. **Start Command**:
   ```bash
   npm run server
   ```
5. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default `$PORT`)
   - `AUTH_BYPASS_DEMO`: `true` (or `false` for strict production JWT)
   - `DEMO_API_KEY`: `your_secure_api_key`
   - `JWT_SECRET`: `your_jwt_secret_token`
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `...`
   - `RAZORPAY_WEBHOOK_SECRET`: `...`
   - `VITE_API_BASE_URL`: `https://your-render-service.onrender.com/api`
   - `DATABASE_PATH`: `/var/data/revivepay.sqlite` (Attach persistent disk on `/var/data`)

---

## ⚡ Option 3: Railway.app Deployment

1. **Deploy from GitHub repo**: Select `Deeppatil-AI/RevivePay`.
2. **Add Persistent Volume**: Mount a volume at `/data` and set `DATABASE_PATH=/data/revivepay.sqlite`.
3. **Set Start Command**: `npm run build && npm run server`.
4. Railway will assign an automated SSL domain (`https://revivepay-production.up.railway.app`).

---

## 🔒 Production Security Checklist

- [ ] Set `AUTH_BYPASS_DEMO=false` to enforce signed JWT authentication across all endpoints.
- [ ] Provide strong random strings for `JWT_SECRET` and `DEMO_API_KEY`.
- [ ] Configure `RAZORPAY_WEBHOOK_SECRET` matching your Razorpay Dashboard Webhook settings.
- [ ] Verify `GET /api/health` returns `authMode: "JWT_STRICT"`.
- [ ] Attach persistent SSD storage for SQLite database to prevent state reset on redeployment.
