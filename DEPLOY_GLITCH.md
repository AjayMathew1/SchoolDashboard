# Glitch Deployment Guide

Deploy your Academic Dashboard to Glitch for **free** - no credit card required!

## 🚀 Quick Deploy (5 Minutes)

### Option 1: Import from GitHub (Recommended)

1. **Go to Glitch**
   - Visit https://glitch.com
   - Sign up with GitHub (it's free!)

2. **Create New Project**
   - Click "New Project" → "Import from GitHub"
   - Enter your repository URL: `https://github.com/ajaymathew1/SchoolDashboard`
   - Wait for import (1-2 minutes)

3. **Glitch Will Auto-Setup**
   - It will automatically run `npm run setup` (installs dependencies, builds frontend, initializes database)
   - This takes about 3-5 minutes
   - Watch the logs in the terminal at the bottom

4. **Access Your App**
   - Click "Preview" → "Preview in a new window"
   - Your app will be at: `https://your-project-name.glitch.me`
   - Login: `admin@dashboard.local` / `admin123`

### Option 2: Manual Setup

1. Go to https://glitch.com
2. Create "New Project" → "hello-express"
3. Delete all default files
4. Click "Tools" → "Git, Import, and Export" → "Import from GitHub"
5. Enter: `ajaymathew1/SchoolDashboard`

## 🔧 Configuration

### Environment Variables (Optional)

In Glitch, click on `.env` file and add:

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key-here-change-this
```

Glitch automatically uses `PORT=3000` so this should work by default.

### Database

- Glitch uses **persistent storage** for files in `/data` directory
- Your SQLite database will persist between restarts
- Data is kept even when the project sleeps!

## ⚙️ How It Works

When you deploy to Glitch:

1. **Install Phase**: Installs backend and frontend dependencies
2. **Build Phase**: Builds React frontend to static files
3. **Database Init**: Creates and seeds SQLite database
4. **Server Start**: Express serves API + static frontend files

## 🎯 Project Structure on Glitch

```
/
├── backend/          # Express API
├── frontend/         # React source (not served)
│   └── dist/        # Built files (served in production)
├── package.json     # Root config (tells Glitch what to do)
├── glitch.json      # Glitch-specific configuration
└── .env             # Environment variables
```

## 📝 Important Notes

### ✅ Advantages
- ✅ **No credit card** required
- ✅ **Persistent database** (SQLite data saved)
- ✅ **Auto HTTPS** included
- ✅ **Live editing** in browser
- ✅ **Always-on option** available (can boost to prevent sleep)

### ⚠️ Limitations
- **Auto-sleep**: Project sleeps after 5 minutes of inactivity
- **Wake time**: First visit after sleep takes 10-20 seconds
- **Shared resources**: Free tier shares CPU/memory
- **Public by default**: Anyone can see your code (can make private with paid plan)

### 🔄 Keep-Alive Options

To prevent sleeping:
1. **Glitch Boosted Apps** ($8/month) - never sleeps
2. **UptimeRobot** (free) - pings your app every 5 minutes
3. **Cron-job.org** (free) - scheduled pings

## 🛠️ Making Changes

### After Initial Deployment

**From Glitch Editor:**
1. Edit files directly in Glitch
2. Changes auto-save and refresh
3. For frontend changes: Run `refresh` in terminal to rebuild

**From GitHub:**
1. Make changes locally
2. Push to GitHub: `git push`
3. In Glitch: "Tools" → "Import from GitHub" (reimport)

### Useful Commands in Glitch Terminal

```bash
# Rebuild frontend
npm run build-frontend

# Restart server
refresh

# View logs
logs

# Reinstall everything
npm run setup
```

## 🔐 Security for Production

Before sharing widely:

1. **Change default password**
   - Login and update admin credentials
   - Or modify `backend/src/config/initDb.js`

2. **Set strong JWT secret**
   - Add to `.env`: `JWT_SECRET=your-very-long-random-string`

3. **Consider privacy**
   - Free tier = public code
   - Paid ($8/month) = private projects

## 🌐 Custom Domain (Optional)

Glitch Pro ($8/month) allows custom domains:
- Dashboard at your own domain
- Professional appearance
- Better for portfolio

## 🐛 Troubleshooting

### Build Failed
- Check logs in Glitch terminal
- Make sure Node version is 18+
- Try running `npm run setup` manually

### "Cannot GET /" Error
- Frontend build may have failed
- Run: `npm run build-frontend`
- Check that `frontend/dist` folder exists

### Database Not Working
- Run: `npm run init-db` in terminal
- Check that `backend/database` folder exists
- View `backend/database/school_dashboard.db`

### App is Slow
- Free tier has resource limits
- First load after sleep is slower
- Consider boosting for better performance

## 💰 Cost

**Free Forever Plan:**
- Unlimited public projects
- 1000 project hours/month
- 200MB disk space per project
- Community support

**Boosted Plans** (Optional):
- $8/month = Always-on + more resources
- $10/month = Private projects

## 📚 Resources

- Glitch Help: https://help.glitch.com
- Community Forum: https://support.glitch.com
- Status Page: https://status.glitch.com

## ✨ Your Live App

After deployment:
- **Live URL**: `https://your-project-name.glitch.me`
- **Glitch Editor**: Edit code, view logs, manage project
- **Shareable**: Send link to anyone!

## 🎉 Success!

You now have a fully functional, publicly accessible academic dashboard!

**Share your project:**
- Copy the Glitch URL
- Share on portfolio
- Include in resume/CV
- Demo to teachers/family

Enjoy your deployed dashboard! 🚀
