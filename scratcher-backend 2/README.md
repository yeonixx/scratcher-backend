# Crooked Christian — Scratcher Backend

## Setup

### 1. Deploy to Vercel
- Import this repo in Vercel
- Add environment variables (see below)

### 2. Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|---|---|
| SHOPIFY_STORE_DOMAIN | crookedchristian.myshopify.com |
| SHOPIFY_ADMIN_TOKEN | (from Shopify Admin API setup) |

### 3. Get your Shopify Admin Token
1. Shopify Admin → Settings → Apps and sales channels
2. Develop apps → Create an app → name it "Scratcher"
3. Configure Admin API scopes:
   - read_orders
   - write_orders  
   - read_metaobjects
   - write_metaobjects
4. Install app → copy the Admin API access token

### 4. Update your scratcher page
In page.scratcher.liquid, update the APP_PROXY constant:
  const APP_PROXY = 'https://your-vercel-app.vercel.app/api';

### API Endpoints
- GET  /api/validate?token=xxx  → validate token
- POST /api/use                 → mark token as used
