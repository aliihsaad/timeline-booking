# 🚀 Vercel Deployment Guide - TimeLine Booking

**Last Updated:** October 22, 2025
**Estimated Time:** 10-15 minutes (first time)
**Cost:** Free (Vercel Free Tier)

---

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Get Your Supabase Credentials](#get-your-supabase-credentials)
3. [Deploy to Vercel](#deploy-to-vercel)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Verify Deployment](#verify-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## ✅ Prerequisites

Before you start, make sure you have:
- [x] GitHub account with the timeline-booking repository
- [x] Supabase project set up and running
- [x] Access to your Supabase project credentials
- [ ] Vercel account (we'll create this together)

---

## 🔑 Get Your Supabase Credentials

You'll need 3 environment variables from Supabase:

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Sign in to your account
3. Select your **TimeLine** project (or whatever you named it)

### Step 2: Get Your Credentials

**Navigate to:** Settings → API (left sidebar)

You'll need to copy these 3 values:

#### 1. Project URL
- **Location:** Settings → API → **Project URL**
- **Example:** `https://abcdefghijk.supabase.co`
- **Variable Name:** `VITE_SUPABASE_URL`

#### 2. Anon/Public Key
- **Location:** Settings → API → **Project API keys** → `anon` `public`
- **Looks like:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)
- **Variable Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`

#### 3. Project ID
- **Location:** Settings → General → **Reference ID**
- **Example:** `abcdefghijk` (short alphanumeric string)
- **Variable Name:** `VITE_SUPABASE_PROJECT_ID`

**📝 IMPORTANT:** Keep these values handy - you'll paste them into Vercel in a few steps!

---

## 🌐 Deploy to Vercel

### Step 1: Create Vercel Account

1. Go to **https://vercel.com/signup**
2. Click **"Continue with GitHub"** (easiest option)
3. Authorize Vercel to access your GitHub account
4. Click **"Install"** when asked about repository access
5. Select **"All repositories"** or just **"timeline-booking"**

### Step 2: Import Your Project

1. After signing in, you'll see the Vercel dashboard
2. Click **"Add New..."** button (top right)
3. Select **"Project"**
4. Find **"timeline-booking"** in the list
   - If you don't see it, click **"Import Git Repository"** and paste:
     ```
     https://github.com/aliihsaad/timeline-booking
     ```
5. Click **"Import"**

### Step 3: Configure Build Settings

Vercel should auto-detect your settings, but verify these:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./` (leave blank) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**✅ These should be auto-filled. Don't change them unless needed.**

---

## 🔐 Configure Environment Variables

**CRITICAL STEP:** Before clicking "Deploy", you must add your environment variables.

### On the Vercel import page:

1. Scroll down to **"Environment Variables"** section
2. Click to expand it
3. Add the following 3 variables:

#### Variable 1: Supabase URL
```
Name:  VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
```
*(Replace with your actual Project URL from Supabase)*

#### Variable 2: Supabase Publishable Key
```
Name:  VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*(Replace with your actual anon/public key from Supabase)*

#### Variable 3: Supabase Project ID
```
Name:  VITE_SUPABASE_PROJECT_ID
Value: your-project-id
```
*(Replace with your actual Reference ID from Supabase)*

### How to Add Variables:
1. Type the **Name** in the first field
2. Paste the **Value** in the second field
3. Click **"Add"** button
4. Repeat for all 3 variables

**Environment Scope:** Leave as **"Production, Preview, and Development"** (default)

---

## 🚀 Deploy!

Once all environment variables are added:

1. Click the **"Deploy"** button (big blue button)
2. Wait for the build process (usually 1-3 minutes)
3. Watch the build logs (optional, but cool to see)

### What Happens During Deployment:
- ✅ Vercel clones your GitHub repo
- ✅ Installs npm dependencies
- ✅ Runs `npm run build`
- ✅ Deploys to CDN
- ✅ Generates SSL certificate (HTTPS)
- ✅ Assigns you a URL

### Success! 🎉

When complete, you'll see:
- **Confetti animation** 🎊
- **Your live URL** (e.g., `https://timeline-booking.vercel.app`)
- **Screenshot preview** of your deployed site

---

## ✅ Verify Deployment

### Step 1: Visit Your Site
1. Click on the live URL Vercel shows you
2. Your TimeLine booking site should load
3. Check that it looks correct

### Step 2: Test Critical Features

Test these to ensure everything works:

**Public Features:**
- [ ] Homepage loads
- [ ] Can navigate between pages
- [ ] Booking form appears
- [ ] No console errors (press F12 to check)

**Business Features:**
- [ ] Can access `/business/login`
- [ ] Can log in with your Supabase credentials
- [ ] Dashboard loads after login

**Database Connection:**
- [ ] Try creating a test appointment
- [ ] Check if it appears in Supabase dashboard
- [ ] Verify services load correctly

### Step 3: Check for Common Issues

If something doesn't work:

1. **Check Browser Console (F12)**
   - Look for red errors
   - Common issue: Environment variables not set correctly

2. **Check Vercel Logs**
   - Go to your Vercel dashboard
   - Click on your project
   - Go to "Deployments" tab
   - Click on the latest deployment
   - Check "Build Logs" and "Function Logs"

3. **Verify Environment Variables**
   - In Vercel dashboard: Project → Settings → Environment Variables
   - Make sure all 3 variables are set
   - Values should match your Supabase credentials

---

## 🔧 Troubleshooting

### Issue: "Failed to build"

**Cause:** Missing dependencies or build errors

**Solution:**
1. Check Vercel build logs for specific error
2. Verify `package.json` is committed to GitHub
3. Try building locally: `npm run build`
4. If local build works, redeploy on Vercel

---

### Issue: "Blank page" or "404 Not Found"

**Cause:** SPA routing not configured

**Solution:**
1. Verify `vercel.json` exists in your repo root
2. Check that it contains the rewrites configuration
3. Redeploy if needed

---

### Issue: "Supabase errors" or "Cannot connect to database"

**Cause:** Environment variables not set or incorrect

**Solution:**
1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Verify all 3 variables are present:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
3. Check for typos in variable names (must match exactly)
4. Verify values are correct (compare with Supabase dashboard)
5. After fixing, **trigger a new deployment**:
   - Go to Deployments tab
   - Click "..." menu on latest deployment
   - Select "Redeploy"

---

### Issue: "Changes not showing up"

**Cause:** Cached deployment or not pushed to GitHub

**Solution:**
1. Make sure you committed and pushed changes to GitHub:
   ```bash
   git status
   git add .
   git commit -m "your message"
   git push origin master
   ```
2. Vercel auto-deploys on every push (usually takes 1-2 minutes)
3. Hard refresh your browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

---

### Issue: "Environment variable not working"

**Cause:** Variable added after deployment

**Solution:**
1. After adding/changing environment variables, you must redeploy
2. Go to Deployments → Click "..." on latest → "Redeploy"
3. OR: Make a small change and push to GitHub (triggers auto-deploy)

---

## 🎯 Next Steps

### Automatic Deployments (Already Set Up!)

Every time you `git push` to GitHub, Vercel will:
1. Detect the new commit
2. Automatically build your project
3. Deploy to your live URL
4. Send you a notification

**Timeline:** ~1-2 minutes from push to live

### Get Deployment Notifications

1. Go to your Vercel project settings
2. Navigate to **Notifications**
3. Enable options you want:
   - Deployment started
   - Deployment succeeded
   - Deployment failed
   - Comments (for team collaboration)

### Set Up Preview Deployments (Optional)

Create a new branch to test features before merging:
```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
```

Vercel will create a **preview URL** like:
`https://timeline-booking-git-feature-new-feature.vercel.app`

**Benefits:**
- Test features before merging to main
- Share preview with others
- Each PR gets its own preview URL

### Custom Domain (Optional)

Want to use your own domain? (e.g., `timeline-booking.com`)

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel: Project → Settings → Domains
3. Click "Add Domain"
4. Follow Vercel's instructions to update DNS settings
5. Vercel handles SSL certificate automatically

---

## 📊 Vercel Dashboard Overview

### Key Pages:

**Project Overview:**
- Live URL
- Latest deployment status
- Quick actions

**Deployments:**
- History of all deployments
- Build logs for each
- Redeploy options

**Analytics (Free Tier):**
- Page views
- Top pages
- Visitor countries
- Performance metrics

**Settings:**
- Environment variables
- Domain management
- Team members
- Danger zone (delete project)

---

## 🎉 Success Checklist

After completing this guide, you should have:

- [x] Vercel account created
- [x] Project imported from GitHub
- [x] Environment variables configured
- [x] Successful deployment
- [x] Live URL working
- [x] Database connected
- [x] Automatic deployments enabled

---

## 🆘 Need Help?

If you're stuck:

1. **Check Vercel Status:** https://www.vercel-status.com
2. **Vercel Documentation:** https://vercel.com/docs
3. **Supabase Status:** https://status.supabase.com
4. **Ask me!** I'm here to help debug any issues

---

## 📝 Quick Reference

### Your URLs:
- **Production:** `https://timeline-booking.vercel.app` (will be shown after deployment)
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **Supabase Dashboard:** `https://app.supabase.com`
- **GitHub Repo:** `https://github.com/aliihsaad/timeline-booking`

### Commands:
```bash
# Test build locally
npm run build

# Preview build locally
npm run preview

# Push changes to deploy
git add .
git commit -m "your changes"
git push origin master
```

### Environment Variables:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...
VITE_SUPABASE_PROJECT_ID=xxxxx
```

---

**🚀 Ready to deploy? Follow the steps above and you'll be live in ~10 minutes!**

_Generated with [Claude Code](https://claude.com/claude-code)_
