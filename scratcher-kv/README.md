# Crooked Christian Scratcher Backend v2
Uses Vercel KV (free) — no Shopify Admin API needed.

## Setup

### 1. Deploy to Vercel
Import this repo, deploy.

### 2. Add Vercel KV Database
In Vercel dashboard → Storage → Create Database → KV
Connect it to this project. Vercel auto-adds the env vars.

### 3. Add Environment Variable
WEBHOOK_SECRET = any random string you choose (e.g. "cc-scratcher-2024")
(Use this same secret in Shopify Flow webhook header)

### 4. Update Shopify Flow
Replace the "Update order metafields" actions with one "Send HTTP request" action:
- URL: https://scratcher-backend.vercel.app/api/register
- Method: POST
- Headers: x-shopify-secret: YOUR_WEBHOOK_SECRET
- Body: {
    "token": "{{runCode.token}}",
    "slots": "{{runCode.slots}}",
    "winSym": "{{runCode.winSym}}",
    "winRow": "{{runCode.winRow}}",
    "orderEmail": "{{order.email}}",
    "orderName": "{{order.customer.firstName}}"
  }

## API Endpoints
- POST /api/register  → register new ticket (called by Shopify Flow)
- GET  /api/validate?token=xxx → validate token
- POST /api/use       → mark token as used
