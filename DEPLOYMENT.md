# Deploying to Railway (Backend) + Vercel (Frontend)

This is the recommended deployment for **3-4 non-technical users** who need:
- ✅ Click a link and use the app
- ✅ Persistent data (saved between visits)
- ✅ Shared data (all users see same info)
- ✅ Login protection (not public to the internet)
- ✅ Free (no credit card required to start)

---

## Step 1: Customize User Accounts

Before deploying, edit the user accounts in `backend/src/config/initDb.js`:

```js
const USERS = [
    {
        email: 'admin@dashboard.local',   // ← Change this
        password: 'admin123',              // ← Change this!
        fullName: 'Administrator',
        role: 'admin'
    },
    {
        email: 'user1@dashboard.local',   // ← Change to real email
        password: 'user1pass',             // ← Change this!
        fullName: 'User One',              // ← Change to real name
        role: 'student'
    },
    // ... add/remove users as needed
];
```

> ⚠️ **Important:** Use strong passwords! Anyone with these credentials can access the app.

After editing, commit and push:
```bash
git add .
git commit -m "Customize user accounts"
git push
```

---

## Step 2: Deploy Backend to Railway

### 2a. Create Railway Account
1. Go to https://railway.app
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub

### 2b. Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your `SchoolDashboard` repository
4. Railway will detect the `backend/` folder

### 2c. Configure the Service
1. Click on the service that was created
2. Go to **"Settings"** tab
3. Set **Root Directory** to: `backend`
4. Set **Start Command** to: `npm run init-db && npm start`

### 2d. Add Environment Variables
Go to **"Variables"** tab and add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (click "Generate" for a random value) |
| `FRONTEND_URL` | `*` (update this after Vercel deploy) |

### 2e. Deploy
1. Click **"Deploy"**
2. Wait ~3 minutes for build to complete
3. Copy your backend URL (looks like: `https://schooldashboard-production.up.railway.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3a. Create Vercel Account
1. Go to https://vercel.com
2. Click "Sign Up" → "Continue with GitHub"
3. Authorize Vercel

### 3b. Import Project
1. Click **"Add New"** → **"Project"**
2. Find and select your `SchoolDashboard` repository
3. Click **"Import"**

### 3c. Configure Build Settings
In the configuration screen:

| Setting | Value |
|---|---|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 3d. Add Environment Variable
Under **"Environment Variables"**, add:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://your-railway-url.up.railway.app/api` |

> Replace `your-railway-url` with the actual URL from Step 2e!

### 3e. Deploy
1. Click **"Deploy"**
2. Wait ~2 minutes
3. Copy your Vercel URL (looks like: `https://school-dashboard.vercel.app`)

---

## Step 4: Update Railway CORS

Now that you have your Vercel URL, update Railway:

1. Go back to Railway → Your project → **Variables**
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   https://school-dashboard.vercel.app
   ```
3. Railway will automatically redeploy

---

## Step 5: Test Everything

1. Visit your Vercel URL
2. Login with one of your user accounts
3. Create a test entry (e.g., add a subject)
4. Open a different browser or incognito window
5. Login with a different user account
6. Verify you can see the entry created in step 3 ✅

---

## Sharing with Your Users

Send each user:
- **App URL**: `https://your-app.vercel.app`
- **Their email**: (what you set in initDb.js)
- **Their password**: (what you set in initDb.js)

Example message to send:
```
Hi! Here's your access to the Academic Dashboard:

🔗 Link: https://your-app.vercel.app
📧 Email: user1@dashboard.local
🔑 Password: user1pass

Just click the link and login. Let me know if you have any issues!
```

---

## Future Updates

When you make code changes:
```bash
git add .
git commit -m "Your update description"
git push
```

Both Railway and Vercel will **automatically redeploy** from GitHub! 🎉

---

## Troubleshooting

### "Network Error" on login
- Check that `VITE_API_URL` in Vercel points to your Railway URL
- Make sure it ends with `/api` (e.g., `https://xxx.railway.app/api`)

### Data not saving
- Check Railway logs for errors
- Ensure `NODE_ENV=production` is set in Railway variables

### CORS errors in browser console
- Update `FRONTEND_URL` in Railway to match your exact Vercel URL
- Redeploy Railway after changing variables

### Railway free credit running out
- Railway gives $5/month free credit
- Light usage by 3-4 people should last the whole month
- Monitor usage in Railway dashboard

---

## Cost Summary

| Service | Cost |
|---|---|
| Vercel (Frontend) | **Free forever** |
| Railway (Backend) | **$5 free credit/month** |
| **Total** | **$0** for light usage |

Railway's $5 credit is more than enough for 3-4 users with light usage. If you exceed it, Railway charges ~$0.000463/GB-hour which is very affordable.
