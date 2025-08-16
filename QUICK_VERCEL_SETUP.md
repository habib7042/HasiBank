# Quick Vercel Database Setup

## Copy This Exact Value:

**Environment Variable Name:**
```
DATABASE_URL
```

**Environment Variable Value:**
```
postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Steps:

1. **Go to Vercel Dashboard**
   - Open [vercel.com](https://vercel.com)
   - Go to your HasiBank project

2. **Settings → Environment Variables**
   - Click "Settings" tab
   - Click "Environment Variables" on the left

3. **Add New Variable**
   - **Name**: `DATABASE_URL`
   - **Value**: Paste the URL above (exactly as shown)
   - **Environment**: Select all three: Production, Preview, Development
   - **Type**: Encrypted
   - Click "Add"
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click the three dots (⋯) next to latest deployment
   - Click "Redeploy"

5. **Test**
   - Open your app
   - Enter PIN: `7042`
   - Should work perfectly!

## Important:
- ❌ **Don't add quotes** around the URL
- ❌ **Don't add extra spaces** before or after
- ✅ **Copy exactly** as shown above
- ✅ **Select all environments** (Production, Preview, Development)

## After Setup:
- PIN: 7040
- Users: Shobuj, Shitu
- Database: Connected to Neon.tech

## Troubleshooting:
If it still doesn't work, visit: `https://your-app.vercel.app/api/debug`