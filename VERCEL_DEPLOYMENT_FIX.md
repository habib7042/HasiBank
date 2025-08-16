# Vercel Deployment Database Connection Fix

## Problem
The error occurs because the `DATABASE_URL` environment variable is not properly configured on Vercel.

## Error Message
```
Error [PrismaClientInitializationError]: 
Invalid `prisma.settings.findFirst()` invocation:

error: Error validating datasource `db`: the URL must start with the protocol 'postgresql://' or 'postgres://'.
```

## Solution

### Step 1: Set Environment Variable on Vercel

1. **Go to Vercel Dashboard**
   - Navigate to your HasiBank project
   - Click on **Settings** tab

2. **Environment Variables**
   - Click on **Environment Variables** in the left sidebar
   - Add the following environment variable:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |

3. **Environment Settings**
   - **Environment**: Select **Production**, **Preview**, and **Development**
   - **Type**: Choose **Encrypted** (recommended for sensitive data)
   - Click **Add**
   - Click **Save**

### Step 2: Redeploy the Application

1. **Manual Redeploy**
   - Go to the **Deployments** tab
   - Click on the three dots (⋯) next to the latest deployment
   - Select **Redeploy**

2. **Or Trigger New Deployment**
   - Push a small change to trigger automatic deployment
   - Or use Vercel CLI to redeploy

### Step 3: Verify the Deployment

After redeployment, test the PIN verification:
- **PIN**: `7042`
- **Expected Result**: Should successfully log in to the dashboard

### Step 4: If Still Not Working

#### Check Environment Variable on Vercel:
1. Go to **Settings** → **Environment Variables**
2. Verify the `DATABASE_URL` is exactly:
   ```
   postgresql://neondb_owner:npg_0sdCXl8TMhQW@ep-red-dew-a1dte3uq-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

#### Common Issues:
1. **Missing quotes**: Don't include quotes in the Vercel environment variable value
2. **Extra spaces**: Remove any leading or trailing spaces
3. **Wrong environment**: Make sure it's set for Production, Preview, and Development
4. **Case sensitivity**: Ensure `DATABASE_URL` is in uppercase

#### Alternative: Use Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set environment variable
vercel env add DATABASE_URL

# Choose Production, Preview, Development
# Paste the URL when prompted
# Redeploy
vercel --prod
```

### Step 5: Test Database Connection

After setting up the environment variable, you can test the connection by:

1. **Check Vercel Logs**
   - Go to your project dashboard
   - Click on **Functions** tab
   - Look for the `verify-pin` function
   - Check the logs for any errors

2. **Test PIN Verification**
   - Visit your deployed application
   - Try to log in with PIN: `7042`
   - Should successfully access the dashboard

### Step 6: Verify Database Schema

Make sure the database tables exist on the Neon.tech database:

1. **Connect to Neon.tech**
   - Go to Neon.tech dashboard
   - Select your database
   - Open the SQL editor

2. **Check Tables**
   ```sql
   -- List all tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE';
   
   -- Check if data exists
   SELECT * FROM "User";
   SELECT * FROM "Settings";
   SELECT * FROM "Deposit";
   ```

### Expected Results:
- **User table**: Should contain Shobuj and Shitu
- **Settings table**: Should contain PIN 7042
- **Deposit table**: Should be empty (ready for deposits)

### Final Verification

Once the environment variable is set correctly:
1. ✅ PIN verification should work
2. ✅ Dashboard should load successfully
3. ✅ User data should be displayed
4. ✅ Deposit functionality should work

### Troubleshooting Checklist

- [ ] `DATABASE_URL` is set in Vercel environment variables
- [ ] URL format is correct (starts with `postgresql://`)
- [ ] No extra spaces or quotes in the URL
- [ ] Environment variable is set for Production, Preview, and Development
- [ ] Application has been redeployed after setting the variable
- [ ] Database tables exist and contain data
- [ ] PIN 7042 exists in the Settings table

### Contact Support

If you still encounter issues:
1. Check Vercel deployment logs
2. Verify Neon.tech database is accessible
3. Ensure no typos in the database URL
4. Contact Vercel or Neon.tech support if needed

---

**Note**: The local development environment works correctly, so the issue is specifically with the Vercel environment configuration.