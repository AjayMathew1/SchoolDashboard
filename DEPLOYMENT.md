# Deployment Guide - Render

This guide will help you deploy the Academic Dashboard to Render for free.

## Prerequisites

- ✅ GitHub account with your code pushed
- ✅ Render account (sign up at https://render.com)

## Deployment Steps

### 1. Push Code to GitHub

Make sure your latest code is on GitHub:
```bash
cd /home/yoda/Developer/AIProjects/SchoolDashboard
git add .
git commit -m "Add Render deployment configuration"
git push
```

### 2. Deploy on Render

#### Option A: Using Blueprint (Recommended - Easiest)

1. Go to https://render.com/
2. Click "Get Started for Free" (or login if you have an account)
3. Connect your GitHub account
4. Click "New" → "Blueprint"
5. Select your `SchoolDashboard` repository
6. Render will automatically detect the `render.yaml` file
7. Click "Apply" to create both services

#### Option B: Manual Deployment

**Deploy Backend:**
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: `school-dashboard-api`
   - Environment: `Node`
   - Build Command: `cd backend && npm install && npm run init-db`
   - Start Command: `cd backend && npm start`
   - Instance Type: `Free`
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `JWT_SECRET` = (auto-generate or use a random string)
5. Click "Create Web Service"

**Deploy Frontend:**
1. Click "New" → "Static Site"
2. Connect your GitHub repository
3. Configure:
   - Name: `school-dashboard-frontend`
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`
4. Add Environment Variable:
   - `VITE_API_URL` = `https://school-dashboard-api.onrender.com/api` (use your actual backend URL)
5. Click "Create Static Site"

### 3. Wait for Deployment

- Backend takes ~5-10 minutes for first deployment
- Frontend takes ~3-5 minutes
- Watch the build logs for any errors

### 4. Update Frontend API URL

After backend is deployed:
1. Copy the backend URL (e.g., `https://school-dashboard-api.onrender.com`)
2. Go to Frontend service settings → Environment
3. Update `VITE_API_URL` to: `https://your-backend-url.onrender.com/api`
4. Manual redeploy the frontend

### 5. Access Your App

Your app will be available at:
- **Frontend**: `https://school-dashboard-frontend.onrender.com`
- **Backend API**: `https://school-dashboard-api.onrender.com/api`

Default login:
- Email: `admin@dashboard.local`
- Password: `admin123`

## Important Notes

### ⚠️ Free Tier Limitations

1. **Data Persistence**: 
   - Free tier uses ephemeral storage
   - Database resets when service restarts (after 15 min of inactivity)
   - For persistent data, upgrade to paid tier or migrate to PostgreSQL

2. **Cold Starts**:
   - Services sleep after 15 minutes of inactivity
   - First request after sleep takes 30-60 seconds to wake up

3. **Build Time**:
   - Free tier has limited build minutes per month
   - Multiple deployments count toward this limit

### 🔄 Auto-Deployment

Render automatically redeploys when you push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push
```

### 🔒 Production Recommendations

For production use, consider:
1. Migrate SQLite → PostgreSQL (Render offers free 90-day trial)
2. Change default admin credentials
3. Set up proper JWT secret
4. Enable HTTPS (Render does this automatically)

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

### Frontend Can't Connect to Backend
- Verify `VITE_API_URL` is set correctly in frontend environment
- Check CORS settings in backend
- Ensure backend URL ends with `/api`

### Database Not Initializing
- Check backend build logs
- Ensure `npm run init-db` runs during build
- Verify database path is writable

## Cost

- **Free Forever**: Both services on free tier
- **Optional Upgrades**:
  - Paid tier ($7/month per service) for persistent storage
  - PostgreSQL database (90-day free trial, then $7/month)

## Support

For issues:
- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
