# 🚀 DEPLOY YOUR PROJECT TO NETLIFY - SIMPLE STEPS

**Your API keys are ready. Let's deploy!**

---

## ✅ YOUR API KEYS (From Your Files)

**NVIDIA API Key:**
```
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
```

**RapidAPI Key:**
```
a8755c0e64mshfa1eac5f4c0ab86p1fde42jsnfd6292cdc6d7
```

---

## 🔧 OPTION 1: Fix Git & Deploy (Recommended)

Open PowerShell and run **one command at a time**:

### **1. Force push to GitHub:**
```powershell
cd C:\Users\nived\Desktop\dd\resume-job-recommendation-ai
git push origin main --force
```

### **2. Go to Netlify:**
1. Visit: https://app.netlify.com/
2. Sign in with GitHub
3. Click "Add new site"
4. Choose "Import an existing project"  
5. Select GitHub
6. Pick your repo: `job-rec`

### **3. Add environment variables:**

In Netlify, add these 2 variables:

```
NVIDIA_API_KEY
Value: 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

RAPIDAPI_KEY
Value: a8755c0e64mshfa1eac5f4c0ab86p1fde42jsnfd6292cdc6d7
```

### **4. Deploy!**
Click "Deploy site"

Your app will be live in 3-4 minutes! 🎉

---

## 🔧 OPTION 2: Deploy Without Git (Direct)

If Git is causing issues, deploy directly:

### **1. Install Netlify CLI:**
```powershell
npm install -g netlify-cli
```

### **2. Login to Netlify:**
```powershell
netlify login
```
(Opens browser - authorize)

### **3. Deploy:**
```powershell
cd C:\Users\nived\Desktop\dd\resume-job-recommendation-ai

# Set environment variables
$env:NVIDIA_API_KEY="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"
$env:RAPIDAPI_KEY="a8755c0e64mshfa1eac5f4c0ab86p1fde42jsnfd6292cdc6d7"

# Deploy
netlify deploy --prod
```

Follow the prompts:
- Create new site? **Yes**
- Build command: `npm run build`
- Publish directory: `.next`

### **4. Add environment variables in Netlify dashboard:**
After deployment:
1. Go to your site in Netlify
2. Site settings → Environment variables
3. Add both keys (from above)
4. Redeploy

---

## 🎯 SIMPLEST METHOD - Manual Netlify Deploy

### **1. Build locally:**
```powershell
cd C:\Users\nived\Desktop\dd\resume-job-recommendation-ai
npm run build
```

### **2. Go to Netlify:**
- Visit: https://app.netlify.com/drop
- Drag and drop the `.next` folder
- Site deploys instantly!

### **3. Add environment variables:**
- Go to site settings
- Environment variables
- Add your 2 keys
- Redeploy

---

## ✅ QUICK CHECKLIST

Choose your method:

**Method 1: Via GitHub (Best)**
- [ ] Force push: `git push origin main --force`
- [ ] Go to Netlify
- [ ] Import from GitHub
- [ ] Add 2 environment variables
- [ ] Deploy

**Method 2: Via CLI**
- [ ] Install: `npm install -g netlify-cli`
- [ ] Login: `netlify login`  
- [ ] Deploy: `netlify deploy --prod`
- [ ] Add environment variables
- [ ] Redeploy

**Method 3: Drag & Drop**
- [ ] Build: `npm run build`
- [ ] Visit: https://app.netlify.com/drop
- [ ] Drag `.next` folder
- [ ] Add environment variables
- [ ] Redeploy

---

## 🆘 IF YOU GET STUCK

### **Git push fails?**
```powershell
git push origin main --force
```

### **Build fails?**
```powershell
# Clean and rebuild
Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
npm install
npm run build
```

### **Netlify build fails?**
- Check environment variables are set correctly
- No spaces in the keys
- Both keys must be present

---

## 📞 YOUR NEXT STEP

**Pick ONE method above and follow the steps!**

I recommend **Method 1** (Via GitHub) - it's easiest and enables auto-deploy.

**Your GitHub repo:** https://github.com/Knnivedh/job-rec

Just:
1. Force push: `git push origin main --force`
2. Go to Netlify
3. Import repo
4. Add keys
5. Deploy!

**Total time: 5 minutes** 🚀

---

## 🎉 AFTER DEPLOYMENT

You'll get a URL like:
```
https://your-site.netlify.app
```

**Test it:**
- Upload a resume
- Check AI analysis
- View jobs
- Try chatbot

**Everything should work!** ✨

---

**Choose your method and start deploying!** 🚀

