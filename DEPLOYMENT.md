# 🚀 Paplu Physics — Complete Deployment Guide

## Overview
- **Main site**: `papluphysics.in` → folder `/paplu-physics`
- **Admin panel**: `admin.papluphysics.in` → folder `/admin`
- Both are separate Next.js apps deployed on Vercel

---

## STEP 1 — Create Free Accounts (15 min)

### 1.1 Supabase (Database + Auth)
1. Go to **https://supabase.com** → Sign up free
2. Click **New Project** → Name it `paplu-physics`
3. Set a strong database password (save it!)
4. Wait ~2 min for project to start
5. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `anon public` key → this is your `SUPABASE_ANON_KEY`
   - `service_role` key → this is your `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Google OAuth
1. Go to **https://console.cloud.google.com**
2. Create new project → Enable **Google+ API**
3. Go to **Credentials → Create OAuth 2.0 Client**
4. Authorized redirect URIs: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
5. Copy `Client ID` and `Client Secret`
6. In Supabase: **Authentication → Providers → Google** → Enable → paste credentials

### 1.3 Cloudflare R2 (PDF Storage)
1. Go to **https://dash.cloudflare.com** → Sign up free
2. Left menu → **R2 → Create Bucket** → Name: `paplu-physics-pdfs`
3. **R2 → Manage R2 API Tokens → Create Token** with Read+Write
4. Copy `Access Key ID`, `Secret Access Key`, `Account ID`

### 1.4 Vercel (Hosting)
1. Go to **https://vercel.com** → Sign up with GitHub
2. Install **Vercel CLI**: `npm i -g vercel`

---

## STEP 2 — Set Up Database (5 min)

1. In Supabase, go to **SQL Editor**
2. Open file: `database/schema.sql`
3. Copy ALL content → Paste into SQL Editor → Click **Run**
4. You should see "Success" for all tables

### 2.1 — Add Reviews Table (required for Student Reviews feature)

Run this in the Supabase SQL Editor:

```sql
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_name text not null,
  city text,
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  text text not null check (length(text) >= 10 and length(text) <= 500),
  approved boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists reviews_approved_created_idx on reviews (approved, created_at desc);
```

---

## STEP 3 — Generate Admin Password Hash

Run this command on your computer (Node.js required):

```bash
node -e "const b=require('bcryptjs');console.log(b.hashSync('YourAdminPassword123',10))"
```

Copy the output hash — you'll need it in Step 4.

---

## STEP 4 — Deploy Main Site

```bash
cd paplu-physics
npm install
vercel login
vercel
```

When asked, set these Environment Variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth client secret |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_XXXXXXXXXX` (add later) |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret (add later) |
| `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret (add later) |
| `JWT_SECRET` | Any random 64-char string |
| `R2_ACCOUNT_ID` | Your Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Your R2 access key |
| `R2_SECRET_ACCESS_KEY` | Your R2 secret |
| `R2_BUCKET_NAME` | `paplu-physics-pdfs` |
| `NEXT_PUBLIC_SITE_URL` | `https://papluphysics.in` |

Then deploy:
```bash
vercel --prod
```

---

## STEP 5 — Deploy Admin Panel

```bash
cd admin
npm install
vercel
```

Set these Environment Variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Same Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same service role key |
| `ADMIN_EMAIL` | `admin@papluphysics.in` |
| `ADMIN_PASSWORD_HASH` | The bcrypt hash from Step 3 |
| `ADMIN_SECRET_KEY` | Any random 64-char string |

```bash
vercel --prod
```

---

## STEP 6 — Connect Your Domain

### Main Site
1. In Vercel → your project → **Domains**
2. Add `papluphysics.in`
3. In your domain registrar (GoDaddy/Namecheap etc.):
   - Add `A record` → `76.76.21.21`
   - Add `CNAME www` → `cname.vercel-dns.com`

### Admin Panel
1. In Vercel → admin project → **Domains**
2. Add `admin.papluphysics.in`
3. In domain registrar: Add `CNAME admin` → `cname.vercel-dns.com`

---

## STEP 7 — Connect Razorpay (When Ready)

1. Create account at **https://dashboard.razorpay.com**
2. Get Test keys first → Test everything
3. Set up Webhook:
   - URL: `https://papluphysics.in/api/webhooks/razorpay`
   - Events: `payment.captured`, `payment.failed`
   - Copy the Webhook Secret
4. Update Vercel env vars with real Razorpay keys
5. When ready for live: Switch to Live keys in Razorpay dashboard

---

## STEP 8 — Upload Your First PDF

1. Login to Admin panel: `admin.papluphysics.in`
2. Go to **Papers → Add Paper**
3. Fill in details, upload PDF
4. The PDF goes to Cloudflare R2 automatically

---

## Development (Local Testing)

```bash
# Terminal 1 — Main site
cd paplu-physics
cp .env.example .env.local
# Fill .env.local with your values
npm install
npm run dev
# Opens at http://localhost:3000

# Terminal 2 — Admin
cd admin
npm install
npm run dev
# Opens at http://localhost:3001
```

---

## File Structure

```
paplu-physics/
├── src/
│   ├── app/
│   │   ├── page.tsx              ← Homepage
│   │   ├── papers/page.tsx       ← Papers catalog
│   │   ├── login/page.tsx        ← OTP + Google login
│   │   ├── dashboard/page.tsx    ← Student dashboard
│   │   ├── wallet/page.tsx       ← Wallet
│   │   ├── referral/page.tsx     ← Referral + leaderboard
│   │   ├── checkout/page.tsx     ← Payment
│   │   └── api/
│   │       ├── payment/          ← Razorpay APIs
│   │       ├── download/         ← Secure PDF download
│   │       └── webhooks/         ← Razorpay webhook
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PaperCard.tsx
│   │   └── CartDrawer.tsx
│   ├── context/
│   │   └── LangContext.tsx       ← English/Gujarati
│   └── lib/
│       ├── papers.ts             ← Paper catalog
│       ├── cartStore.ts          ← Cart (Zustand)
│       └── supabase.ts           ← DB client
├── database/
│   └── schema.sql                ← Paste into Supabase
└── admin/                        ← Separate admin app
    └── src/app/
        ├── page.tsx              ← Admin login
        ├── dashboard/            ← Overview + charts
        ├── papers/               ← Upload/manage PDFs
        ├── users/                ← User management
        ├── withdrawals/          ← Approve withdrawals
        ├── coupons/              ← Coupon management
        ├── analytics/            ← Revenue charts
        ├── downloads/            ← Leak tracking
        ├── notifications/        ← Push notifications
        └── settings/             ← Prices, commission
```

---

## What Works Now (Without Razorpay/Supabase)

✅ Full UI — homepage, papers, login, dashboard, wallet, referral  
✅ Cart with combo pricing (₹60 for 3)  
✅ Language toggle (English ↔ Gujarati)  
✅ Admin panel — all pages functional with mock data  
✅ Admin login (dev mode: email=admin@papluphysics.in, password=admin123)  

## What Needs Connecting

🔲 Supabase → real user auth, purchases, wallet DB  
🔲 Razorpay → real payments  
🔲 Cloudflare R2 → real PDF storage and download  
🔲 Google OAuth → add credentials to Supabase  

---

## Support

For questions, check each file's `// TODO:` comments — they show exactly what to uncomment when each service is connected.
