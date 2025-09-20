# 🚀 VERCEL DEPLOYMENT GUIDE - AI Resume Matcher

## ✅ **QUICK DEPLOY FROM GITHUB**

Your AI Resume Recommendation System is ready for instant Vercel deployment!

### 🎯 **DEPLOY TO VERCEL - 3 SIMPLE STEPS**

#### **Step 1: Import from GitHub**
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub (free!)
3. Click "New Project"
4. Import `https://github.com/Knnivedh/job-rec`

#### **Step 2: Configure Build Settings**
Vercel will auto-detect Next.js:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### **Step 3: Add Environment Variables**
In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key  
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
MAX_FILE_SIZE=10485760
```

**Deploy** - Vercel will build and deploy automatically! 🚀

---

## 🔑 **Get Your API Keys**

### **Supabase Setup** (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Get keys from Settings → API
4. Run SQL schema from `database/schema.sql`

### **Groq API Setup** (Free Tier)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up with Google/GitHub
3. Create API key
4. Free tier: 30 requests/minute

---

## 🎉 **After Deployment**

✅ **Automatic HTTPS** - Secure by default  
✅ **Custom Domain** - Add your own domain  
✅ **Analytics** - Built-in performance tracking  
✅ **Edge Functions** - API routes run globally  
✅ **Preview Deployments** - Test changes safely  

---

## 🔥 **Your Live App Features**

- 🎨 **Beautiful Landing Page** - Professional gradient design
- 🔐 **Secure Authentication** - Email + Google OAuth
- 📄 **Resume Upload** - PDF/DOCX parsing with AI
- 🤖 **AI Job Matching** - Groq-powered recommendations
- 📊 **Match Scoring** - Percentage-based compatibility
- 📱 **Mobile Perfect** - Responsive on all devices

---

## 🚨 **Troubleshooting**

**Build Errors:**
- Verify all environment variables are set
- Check Supabase project is active
- Confirm Groq API key is valid

**Deployment Issues:**
- Ensure GitHub repository is public or connected
- Check build logs in Vercel dashboard
- Verify dependencies in package.json

**Runtime Errors:**
- Check environment variables in Vercel settings
- Verify Supabase RLS policies are enabled
- Test API endpoints individually

---

## 📈 **Performance Optimizations**

- ⚡ **Edge Runtime** - API routes run on edge
- 🗜️ **Code Splitting** - Optimized bundle size
- 🖼️ **Image Optimization** - Automatic WebP conversion
- 📦 **Static Generation** - Pre-rendered pages
- 🌐 **Global CDN** - Fast worldwide delivery

**Your AI Resume Matcher will be live in minutes! 🚀**