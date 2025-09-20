# job-rec
>>>>>>> 94cad14e34579cae0a14be6894528f00fe4cf731
# AI Resume Job Recommendation System

An AI-powered job recommendation system that analyzes resumes and provides personalized job matches using **Groq API** (free models) and Supabase.

## 🚀 Live Demo

Deploy to Vercel: [https://github.com/Knnivedh/job-rec](https://github.com/Knnivedh/job-rec)

## ✨ Features

- **🎨 Beautiful UI**: Modern landing page with professional gradient design
- **🔐 Secure Authentication**: Email + Google OAuth via Supabase Auth
- **📄 Smart Resume Upload**: PDF/DOCX parsing with AI extraction
- **🤖 AI-Powered Matching**: Groq's Llama 3.1 8B Instant model for job recommendations
- **📊 Match Scoring**: Percentage-based job compatibility scores
- **📱 Mobile Responsive**: Works perfectly on all devices
- **⚡ Real-time Updates**: Live job recommendation updates
- **🔒 Enterprise Security**: Row Level Security with Supabase

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless Functions)
- **AI**: Groq API (Llama 3.1 8B Instant - Free Tier)
- **Database**: PostgreSQL with pgvector (Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel (optimized configuration)
- **File Processing**: pdf-parse, mammoth for resume parsing

## 🚀 Quick Deploy to Vercel

1. **Clone & Deploy**:
   ```bash
   git clone https://github.com/Knnivedh/job-rec.git
   cd job-rec
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import this GitHub repository
   - Add environment variables (see below)
   - Deploy!

3. **Environment Variables** (add in Vercel dashboard):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   GROQ_API_KEY=your-groq-api-key
   MAX_FILE_SIZE=10485760
   ```

## 🔧 Local Development

### Prerequisites

- Node.js 18+
- Supabase account (free tier)
- Groq API key (free tier - 30 requests/minute)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Knnivedh/job-rec.git
   cd job-rec
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment setup**:
   ```bash
   cp env.example .env.local
   ```
   Fill in your API keys in `.env.local`

4. **Database setup**:
   - Create Supabase project
   - Run SQL from `database/schema.sql`
   - Enable Row Level Security

5. **Start development server**:
   ```bash
   npm run dev
   ```

   Visit `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── auth/page.tsx         # Authentication
│   ├── dashboard/page.tsx    # Main dashboard
│   └── api/                  # API routes (serverless)
├── components/               # React components
├── lib/                      # Utilities and integrations
└── types/                    # TypeScript definitions
```

## 🎯 User Journey

1. **🎨 Landing Page** → Beautiful gradient design with call-to-action
2. **🔐 Authentication** → Secure email/Google OAuth login
3. **📄 Resume Upload** → Drag & drop PDF/DOCX files
4. **🤖 AI Analysis** → Groq AI processes resume and skills
5. **🎯 Job Matching** → Personalized recommendations with scores
6. **📱 Mobile Experience** → Fully responsive on all devices

## 🔒 Security Features

- **Row Level Security (RLS)** - User data isolation
- **API Protection** - All endpoints secured
- **File Validation** - Safe upload handling
- **XSS Protection** - Security headers configured
- **Authentication Required** - Protected routes

## 📊 Performance

- **Build Size**: ~135KB initial load
- **Core Web Vitals**: Optimized for speed
- **Serverless Functions**: Auto-scaling API routes
- **Global CDN**: Fast worldwide delivery
- **Static Generation**: Pre-rendered pages

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test ai-student-system.test.ts
```

## 🚀 Deployment Options

### Vercel (Recommended)

- **Automatic deployments** from GitHub
- **Serverless functions** for API routes
- **Global edge network**
- **Built-in analytics**

See `VERCEL_DEPLOYMENT.md` for detailed instructions.

### Other Platforms

- Netlify (see `netlify.toml`)
- Railway
- DigitalOcean App Platform

## 📊 Database Schema

- `app_users` - User profiles
- `resumes` - Resume data and metadata
- `jobs` - Job postings with vector embeddings
- `companies` - Company information
- `job_recommendations` - AI-generated matches
- `recommendation_feedback` - User feedback
- `skills` - Skills master data

## 🛠 API Endpoints

- `POST /api/resumes` - Upload resume
- `GET /api/resumes` - Get user resumes
- `GET /api/recommendations` - Get job matches
- `POST /api/recommendations/feedback` - Submit feedback
- `POST /api/seed-data` - Seed sample data

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Issues
- Verify all environment variables in Vercel/Netlify
- Check Supabase project is active
- Confirm Groq API key is valid

### Authentication Problems
- Check Supabase Auth settings
- Verify redirect URLs
- Ensure RLS policies are enabled

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Groq** for free AI inference
- **Supabase** for backend infrastructure
- **Vercel** for hosting platform
- **Next.js** team for the amazing framework

---

**Built with ❤️ by K N Nivedh**
=======
# job-rec
>>>>>>> 94cad14e34579cae0a14be6894528f00fe4cf731
