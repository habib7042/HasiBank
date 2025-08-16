# Vercel Database Connection Fix - Step by Step

## Current Issue
The error persists on Vercel because the `DATABASE_URL` environment variable is not properly configured.

## Error Message
```
PIN verification error: Error [PrismaClientInitializationError]: 
Invalid `prisma.settings.findFirst()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol 'postgresql://' or 'postgres://'.
```

## Step-by-Step Solution

### Step 1: Verify Vercel Environment Variable Setup

1. **Go to Vercel Dashboard**
   - Navigate to your HasiBank project
   - Click on **Settings** tab

2. **Check Environment Variables**
   - Click on **Environment Variables** in the left sidebar
   - Look for `DATABASE_URL` in the list

3. **If DATABASE_URL exists:**
   - Click the pencil icon to edit
   - **Remove any quotes** from the value
   - **Remove any extra spaces** before or after the URL
   - Ensure the value is exactly:
     ```
     postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
     ```

4. **If DATABASE_URL doesn't exist:**
   - Click **Add new**
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - **Environment**: Select **Production**, **Preview**, and **Development**
   - **Type**: **Encrypted**
   - Click **Add**
   - Click **Save**

### Step 2: Redeploy the Application

1. **Manual Redeploy**
   - Go to **Deployments** tab
   - Find your latest deployment
   - Click the three dots (⋯) next to it
   - Select **Redeploy**

2. **Alternative: Push a small change**
   - Make a small change to any file (like adding a comment)
   - Push to GitHub to trigger automatic deployment

### Step 3: Test the Debug Endpoint

After redeployment, test the debug endpoint to see what's happening:

1. **Visit the debug endpoint**
   ```
   https://your-app-name.vercel.app/api/debug
   ```

2. **Expected Response** (should look like this):
   ```json
   {
     "environment": {
       "NODE_ENV": "production",
       "DATABASE_URL": "***SET***",
       "DATABASE_URL_LENGTH": 123,
       "DATABASE_URL_START": "postgresql://neondb_ow",
       "ALL_ENV_KEYS": ["DATABASE_URL"]
     },
     "database": {
       "success": true,
       "error": "",
       "tables": [
         { "table_name": "Settings" },
         { "table_name": "User" },
         { "table_name": "Deposit" }
       ]
     },
     "timestamp": "2025-08-16T05:10:00.000Z"
   }
   ```

3. **If DATABASE_URL shows "NOT SET"**:
   - The environment variable is not properly set on   - Go back to Step 1 and fix the environment variable setup

### Step 4: Test PIN Verification

1. **Visit your application**
   ```
   https://your-app-name.vercel.app
   ```

2. **Enter PIN**: `7042`

3. **Expected Result**: Should successfully log in to the dashboard

### Step 5: If Still Not Working

#### Check Vercel Logs
1. Go to **Functions** tab in Vercel dashboard
2. Look for `verify-pin` function
3. Check the logs for specific error messages

#### Common Issues and Fixes

**Issue 1: DATABASE_URL not set**
- **Symptom**: Debug endpoint shows "DATABASE_URL": "***NOT SET***"
- **Fix**: Add the environment variable in Vercel settings

**Issue 2: DATABASE_URL has wrong format**
- **Symptom**: Error about URL format
- **Fix**: Ensure URL starts with `postgresql://` and has no extra quotes/spaces

**Issue 3: Environment variable not available to functions**
- **Symptom**: Environment variable set but still not working
- **Fix**: 
  1. Make sure it's set for all environments (Production, Preview, Development)
  2. Redeploy after setting the variable
  3. Check Vercel project settings for any restrictions

**Issue 4: Database connection issues**
- **Symptom**: Debug endpoint shows database connection failure
- **Fix**: 
  1. Verify Neon.tech database is accessible
  2. Check if database credentials are correct
  3. Ensure Neon.tech database is active

### Step 6: Alternative Solutions

#### Option A: Use Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Set environment variable
vercel env add DATABASE_URL

# Select Production, Preview, Development
# Paste the URL when prompted

# Redeploy
vercel --prod
```

#### Option B: Use vercel.json
Create a `vercel.json` file in your project root:
```json
{
  "env": {
    "DATABASE_URL": "postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
  }
}
```

Then redeploy.

### Step 7: Final Verification

After following these steps:
1. ✅ Debug endpoint shows DATABASE_URL is set
2. ✅ Database connection test passes
3. ✅ PIN verification works with PIN 7042
4. ✅ Dashboard loads successfully
5. ✅ User data is displayed correctly

### Troubleshooting Checklist

- [ ] DATABASE_URL environment variable exists in Vercel settings
- [ ] DATABASE_URL value is correct (no quotes, no extra spaces)
- [ ] Environment variable is set for Production, Preview, and Development
- [ ] Application has been redeployed after setting the variable
- [ ] Debug endpoint shows DATABASE_URL is set
- [ ] Database connection test passes
- [ ] PIN verification works with PIN 7042

### Contact Support

If you still encounter issues after following all these steps:
1. Check Vercel status page for outages
2. Contact Vercel support with your project details
3. Verify Neon.tech database is operational

---

**Important**: The local development environment works perfectly, so this is purely a Vercel deployment configuration issue.