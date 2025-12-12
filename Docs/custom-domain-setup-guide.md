# Custom Domain Setup Guide
**Connect Your Domain to Railway & Vercel**

This guide shows you how to use your own domain (e.g., `flighttracker.yourdomain.com`) instead of the default Railway/Vercel URLs.

---

## Overview

**Goal:** 
- Frontend: `flighttracker.yourdomain.com` (Vercel)
- Backend API: `api.flighttracker.yourdomain.com` (Railway)

**What You Need:**
- A domain name you own (e.g., from Namecheap, GoDaddy, Google Domains, Cloudflare)
- Access to your domain's DNS settings
- Your Railway and Vercel projects already deployed

---

## PART 1: CUSTOM DOMAIN FOR VERCEL (FRONTEND)

Vercel makes this really easy and includes free SSL certificates.

### Step 1: Add Domain in Vercel

1. Go to your Vercel dashboard
2. Click on your **flight-tracker project**
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain, for example:
   - `flighttracker.yourdomain.com` (recommended - subdomain)
   - OR `yourdomain.com` (root domain)

**Recommendation:** Use a subdomain like `flighttracker.yourdomain.com` so you can use your root domain for other things.

### Step 2: Configure DNS

Vercel will show you DNS records to add. There are two options:

**Option A: CNAME Record (Recommended for Subdomains)**

If using `flighttracker.yourdomain.com`:

```
Type:  CNAME
Name:  flighttracker
Value: cname.vercel-dns.com
TTL:   Auto or 3600
```

**Option B: A Record (For Root Domain)**

If using `yourdomain.com`:

```
Type:  A
Name:  @ (or leave blank)
Value: 76.76.21.21
TTL:   Auto or 3600
```

### Step 3: Add DNS Records to Your Domain Provider

The exact steps vary by provider, but generally:

#### For Namecheap:
1. Log into Namecheap
2. Go to **Domain List** → Click **Manage** next to your domain
3. Go to **Advanced DNS** tab
4. Click **Add New Record**
5. Add the CNAME or A record from Vercel
6. Save changes

#### For Cloudflare:
1. Log into Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Add the CNAME or A record from Vercel
6. **Important:** Set Proxy status to **DNS Only** (gray cloud) initially
7. Save

#### For GoDaddy:
1. Log into GoDaddy
2. Go to **My Products** → **DNS**
3. Click **Add** in the Records section
4. Add the CNAME or A record from Vercel
5. Save

#### For Google Domains:
1. Log into Google Domains
2. Click on your domain
3. Go to **DNS** → **Custom records**
4. Click **Manage custom records**
5. Create new record with Vercel's values
6. Save

### Step 4: Verify Domain

1. Back in Vercel, click **Verify** or **Refresh**
2. DNS propagation can take **5 minutes to 48 hours** (usually 10-30 minutes)
3. Once verified, Vercel automatically provisions an SSL certificate
4. Your frontend will be accessible at `https://flighttracker.yourdomain.com`

**Status indicators:**
- ⏳ **Pending**: DNS not propagated yet - wait
- ✅ **Valid**: Domain working!
- ❌ **Invalid**: DNS configuration wrong - double-check records

---

## PART 2: CUSTOM DOMAIN FOR RAILWAY (BACKEND)

Railway also supports custom domains with free SSL.

### Step 1: Add Domain in Railway

1. Go to your Railway dashboard
2. Click on your **backend service** (not the database)
3. Go to **Settings** tab
4. Scroll to **Networking** → **Public Networking**
5. Under **Custom Domain**, click **+ Add Domain**
6. Enter your domain, for example:
   - `api.flighttracker.yourdomain.com`

### Step 2: Configure DNS for Railway

Railway will show you a CNAME record to add:

```
Type:  CNAME
Name:  api.flighttracker (or api)
Value: <something>.up.railway.app
TTL:   Auto or 3600
```

### Step 3: Add DNS Record

Go to your domain provider's DNS settings (same as before) and add the CNAME record Railway provided.

**Example for Namecheap:**
1. Advanced DNS tab
2. Add New Record
3. Type: CNAME Record
4. Host: `api.flighttracker` (or just `api` if your domain is `flighttracker.yourdomain.com`)
5. Value: The Railway URL provided
6. Save

**Example for Cloudflare:**
1. DNS → Add record
2. Type: CNAME
3. Name: `api.flighttracker`
4. Target: Railway URL
5. Proxy status: **DNS Only** (gray cloud)
6. Save

### Step 4: Verify & Wait

1. Railway will automatically verify the DNS
2. Once verified, Railway provisions SSL certificate
3. Your backend will be accessible at `https://api.flighttracker.yourdomain.com`

**This can take 5-30 minutes.**

---

## PART 3: UPDATE YOUR APPLICATION

Once both domains are working, you need to update your application configuration.

### Update Frontend Environment Variables

1. Go to **Vercel** → Your Project → **Settings** → **Environment Variables**
2. Update these variables:

```
REACT_APP_API_URL=https://api.flighttracker.yourdomain.com
REACT_APP_WS_URL=https://api.flighttracker.yourdomain.com/ws-flights
```

3. **Redeploy** your frontend (Vercel doesn't auto-apply env var changes)
   - Go to **Deployments**
   - Click the three dots (...) on latest deployment
   - Click **Redeploy**

### Update Backend CORS Configuration

1. Go to **Railway** → Your Service → **Variables**
2. Update `ALLOWED_ORIGINS`:

```
ALLOWED_ORIGINS=https://flighttracker.yourdomain.com,http://localhost:3000
```

3. Railway automatically redeploys

### Alternative: Update in Code

If you hardcoded CORS in your Spring Boot application:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "https://flighttracker.yourdomain.com",
                    "http://localhost:3000"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

Then commit and push to trigger redeployment.

---

## PART 4: COMPLETE DOMAIN SETUP EXAMPLE

Let's say you own `davidsmith.dev` and want:
- Frontend: `flighttracker.davidsmith.dev`
- Backend: `api.davidsmith.dev`

### DNS Records to Add

In your domain provider's DNS settings:

```
Type    Name                Value                           TTL
-----   -----------------   ------------------------------- -----
CNAME   flighttracker       cname.vercel-dns.com            3600
CNAME   api                 yourapp.up.railway.app          3600
```

### Vercel Configuration

**Project:** flight-tracker-frontend  
**Domain:** flighttracker.davidsmith.dev  
**Environment Variables:**
```
REACT_APP_API_URL=https://api.davidsmith.dev
REACT_APP_WS_URL=https://api.davidsmith.dev/ws-flights
REACT_APP_MAPBOX_TOKEN=your_token
```

### Railway Configuration

**Service:** flight-tracker-backend  
**Domain:** api.davidsmith.dev  
**Environment Variables:**
```
SPRING_PROFILES_ACTIVE=prod
ALLOWED_ORIGINS=https://flighttracker.davidsmith.dev,http://localhost:3000
PORT=8080
```

### Final URLs

- **Frontend:** https://flighttracker.davidsmith.dev
- **Backend API:** https://api.davidsmith.dev/api/flights/current
- **WebSocket:** wss://api.davidsmith.dev/ws-flights

---

## PART 5: SUBDOMAIN STRATEGIES

Here are common approaches for organizing your domains:

### Strategy 1: Separate Subdomains (Recommended)

```
flighttracker.yourdomain.com  → Vercel (Frontend)
api.yourdomain.com            → Railway (Backend)
```

**Pros:**
- Clear separation
- Easy to remember
- Professional

**Cons:**
- Need two DNS records

### Strategy 2: Path-Based (Not Recommended for This Project)

```
flighttracker.yourdomain.com     → Frontend
flighttracker.yourdomain.com/api → Backend (requires reverse proxy)
```

**Pros:**
- Single domain

**Cons:**
- Complex setup
- Not needed for this project

### Strategy 3: Nested Subdomains

```
app.flighttracker.yourdomain.com  → Vercel
api.flighttracker.yourdomain.com  → Railway
```

**Pros:**
- Grouped under "flighttracker"
- Very organized

**Cons:**
- Longer URLs

---

## PART 6: SSL CERTIFICATES (HTTPS)

Both Railway and Vercel automatically provide **free SSL certificates** (HTTPS).

### Vercel SSL
- Automatic via Let's Encrypt
- Renews automatically
- No configuration needed
- Works immediately after domain verification

### Railway SSL
- Automatic via Let's Encrypt
- Renews automatically
- No configuration needed
- Works immediately after domain verification

**You don't need to do anything!** Both platforms handle this automatically.

---

## PART 7: DNS PROPAGATION

After adding DNS records, it takes time for them to propagate globally.

### Checking Propagation

**Online Tools:**
- https://dnschecker.org
- https://www.whatsmydns.net

**Command Line:**
```bash
# Check if your domain resolves
nslookup flighttracker.yourdomain.com

# Check CNAME record
nslookup -type=CNAME flighttracker.yourdomain.com

# Test if it's working
curl https://flighttracker.yourdomain.com
```

### Typical Propagation Times

- **Cloudflare:** 2-5 minutes ⚡
- **Namecheap:** 10-30 minutes
- **GoDaddy:** 30-60 minutes
- **Google Domains:** 10-30 minutes

**Maximum:** 48 hours (but usually much faster)

---

## PART 8: TESTING YOUR CUSTOM DOMAINS

### Test Frontend

1. Open browser
2. Go to `https://flighttracker.yourdomain.com`
3. Check:
   - ✅ Page loads
   - ✅ HTTPS (padlock) works
   - ✅ Map displays
   - ✅ No console errors

### Test Backend

```bash
# Test API endpoint
curl https://api.yourdomain.com/api/flights/current

# Should return JSON with flight data
```

### Test WebSocket Connection

1. Open your frontend at custom domain
2. Open browser console (F12)
3. Check Network tab → WS (WebSocket)
4. Should see connection to `wss://api.yourdomain.com/ws-flights`
5. Status should be "101 Switching Protocols"

---

## PART 9: COMMON ISSUES & SOLUTIONS

### Issue: "Invalid Configuration" on Vercel

**Symptoms:** Vercel shows domain as invalid

**Solutions:**
1. Double-check DNS record spelling
2. Ensure no trailing dots in DNS values
3. Wait 30 minutes for propagation
4. Try removing and re-adding domain in Vercel

### Issue: "This site can't be reached"

**Symptoms:** Domain doesn't load at all

**Solutions:**
1. Check DNS propagation with dnschecker.org
2. Verify CNAME points to correct target
3. Clear your browser cache (Ctrl+Shift+Delete)
4. Try in incognito mode
5. Wait longer (DNS can take up to 48 hours)

### Issue: CORS Errors After Custom Domain

**Symptoms:**
```
Access to fetch at 'https://api.yourdomain.com'
from origin 'https://flighttracker.yourdomain.com'
has been blocked by CORS policy
```

**Solutions:**
1. Update Railway `ALLOWED_ORIGINS` environment variable
2. Include your custom frontend domain
3. Wait for Railway to redeploy
4. Clear browser cache

### Issue: SSL Certificate Invalid

**Symptoms:** Browser shows "Not Secure" or certificate error

**Solutions:**
1. Wait 5-10 minutes for SSL provisioning
2. Try hard refresh (Ctrl+F5)
3. Check if domain is fully verified in Vercel/Railway
4. Contact Vercel/Railway support if persists after 24 hours

### Issue: WebSocket Connection Fails

**Symptoms:** Map works but flights don't update

**Solutions:**
1. Check `REACT_APP_WS_URL` uses `wss://` (not `ws://`)
2. Verify WebSocket endpoint in backend is accessible
3. Check Railway logs for WebSocket errors
4. Test with original Railway URL to isolate issue

---

## PART 10: DOMAIN PROVIDERS COMPARISON

### Best for This Project

| Provider | Ease of Use | DNS Speed | Price/Year | Notes |
|----------|-------------|-----------|------------|-------|
| **Cloudflare** | ⭐⭐⭐⭐⭐ | ⚡ Very Fast | Free registration | Best for developers |
| **Namecheap** | ⭐⭐⭐⭐ | Fast | ~$10-15 | Popular, good UI |
| **Google Domains** | ⭐⭐⭐⭐⭐ | Fast | ~$12 | Simple, no upsells |
| **GoDaddy** | ⭐⭐⭐ | Slower | ~$15-20 | Lots of upsells |

**Recommendation:** Use **Cloudflare** for the fastest DNS changes and best developer experience.

---

## PART 11: SUBDOMAIN WITHOUT OWNING MAIN DOMAIN

If you don't own a domain yet or want to practice first:

### Free Options

**1. Vercel Default Domain**
```
flighttracker-yourusername.vercel.app
```
- Already included, no setup needed
- Professional enough for portfolio

**2. Railway Default Domain**
```
flighttracker-production-xxxx.up.railway.app
```
- Already included, no setup needed

**3. Free Subdomains (Not Recommended for Portfolio)**
- *.is-a.dev
- *.js.org
- *.vercel.app (already included)

**For Ryanair Application:**  
The default Vercel/Railway URLs are **perfectly fine** for your portfolio. Custom domains are nice but not required.

---

## PART 12: UPDATING YOUR DOCUMENTATION

Once you have custom domains set up, update your project README:

### README.md Example

```markdown
# Flight Tracker

Real-time flight tracking application built with Spring Boot and React.

## 🚀 Live Demo

**Frontend:** https://flighttracker.yourdomain.com  
**API:** https://api.yourdomain.com/api/flights/current

## 🛠️ Technology Stack

- **Backend:** Java 17, Spring Boot 3.x, PostgreSQL
- **Frontend:** React 18, Mapbox GL JS
- **Real-time:** WebSocket (STOMP)
- **Deployment:** Railway (backend), Vercel (frontend)
- **Domain:** Custom domain via Cloudflare DNS

## 📦 Architecture

Frontend (Vercel) → API (Railway) → Database (PostgreSQL) → OpenSky API

[Include your architecture diagram]
```

### For Your CV

```
Flight Tracker Application
├─ Live: flighttracker.yourdomain.com
├─ GitHub: github.com/yourusername/flight-tracker
├─ Tech: Java Spring Boot, React, PostgreSQL, WebSocket, Mapbox GL
└─ Deployment: Custom domain with SSL on Railway & Vercel
```

---

## PART 13: STEP-BY-STEP CHECKLIST

Print this and check off as you go:

### Initial Setup
- [ ] Projects deployed on Railway and Vercel (using default URLs)
- [ ] Application working on default URLs
- [ ] Domain name purchased (or using default URLs)

### Vercel Domain
- [ ] Added domain in Vercel project settings
- [ ] Copied CNAME record details
- [ ] Added CNAME to domain provider DNS
- [ ] Waited for DNS propagation (10-30 min)
- [ ] Verified domain shows as "Valid" in Vercel
- [ ] HTTPS working (padlock in browser)

### Railway Domain
- [ ] Added domain in Railway service settings
- [ ] Copied CNAME record details
- [ ] Added CNAME to domain provider DNS
- [ ] Waited for DNS propagation
- [ ] Verified domain shows as connected in Railway
- [ ] HTTPS working

### Update Application
- [ ] Updated Vercel environment variables with new backend URL
- [ ] Redeployed frontend on Vercel
- [ ] Updated Railway ALLOWED_ORIGINS with new frontend URL
- [ ] Railway auto-redeployed
- [ ] Cleared browser cache

### Testing
- [ ] Frontend loads at custom domain
- [ ] HTTPS works (no warnings)
- [ ] Map displays correctly
- [ ] Backend API responds at custom domain
- [ ] WebSocket connects successfully
- [ ] Flights update in real-time
- [ ] No CORS errors in console
- [ ] Works in incognito mode
- [ ] Works on mobile

### Documentation
- [ ] Updated README with custom domain URLs
- [ ] Updated CV with live demo link
- [ ] Updated LinkedIn project if posted
- [ ] Tested all shared links work

---

## PART 14: COST BREAKDOWN

### Domain Costs

**Annual Registration:**
- `.com` domain: ~$10-15/year
- `.dev` domain: ~$12-15/year
- `.io` domain: ~$30-40/year

**DNS Hosting:**
- Free with all providers mentioned

**SSL Certificates:**
- Free (Vercel and Railway provide them)

**Total Annual Cost:**
- Domain: ~$10-15
- Everything else: $0

**Is it worth it?** 
- For Ryanair application: **Optional but nice**
- For long-term portfolio: **Yes, looks more professional**
- If budget is tight: Default URLs are fine

---

## PART 15: ALTERNATIVES TO BUYING A DOMAIN

If you don't want to buy a domain right now:

### Option 1: Use Default URLs (Recommended for Now)

**Just use what Vercel and Railway give you:**
```
Frontend: flighttracker-username.vercel.app
Backend: flighttracker-production.up.railway.app
```

**Pros:**
- Free
- Professional enough
- HTTPS included
- Works immediately

**Cons:**
- Longer URLs
- Less memorable

### Option 2: GitHub Pages Custom Domain

If you already own a domain for other purposes:
- Use subdomain for this project
- No additional cost

### Option 3: Wait Until After Deployment

- Deploy first with default URLs
- Add custom domain later if you get the job
- URLs can be changed anytime without redeployment

---

## RECOMMENDED APPROACH FOR YOUR TIMELINE

Given you're targeting January 31st for Ryanair:

**Weeks 1-4:** Build application, deploy with default URLs  
**Week 5:** If budget allows, buy domain and set up  
**Week 6-7:** Polish and prepare application

**The custom domain is a "nice to have," not a requirement.**

Focus on:
1. Working application ✅ (Required)
2. Clean code on GitHub ✅ (Required)
3. Good documentation ✅ (Required)
4. Custom domain (Optional, can add later)

---

## FINAL RECOMMENDATION

**For Ryanair Application Timeline:**

Use the default URLs Vercel and Railway provide. They're:
- Professional
- Free
- Include HTTPS
- Work immediately

**Add a custom domain later if:**
- You get the job and want to keep it live
- You're using this for long-term portfolio
- You already own a domain

The application quality matters 100x more than having a custom domain.

---

## Quick Commands Reference

```bash
# Check DNS propagation
nslookup your-domain.com

# Check CNAME specifically
dig your-domain.com CNAME

# Test HTTPS
curl -I https://your-domain.com

# Check SSL certificate
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

**Bottom line:** Custom domains are nice but optional. The default Vercel/Railway URLs are perfectly professional for a portfolio project. Focus on building a great application first, domain second.

Good luck! 🚀
