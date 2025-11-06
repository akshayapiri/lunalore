# Deploy LunaLore to Render

## Steps to Deploy:

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Delete existing service** (if you have one with errors):
   - Go to your dashboard
   - Find the service that's failing
   - Click on it → Settings → Delete

3. **Create New Static Site**:
   - Click "New +" button
   - **IMPORTANT**: Select **"Static Site"** (NOT "Web Service")
   - This is crucial - Web Service will try to run npm, Static Site won't

4. **Connect Repository**:
   - Connect your GitHub account if not already connected
   - Select repository: `akshayapiri/lunalore`
   - Branch: `main`

5. **Configure Settings**:
   - **Name**: `lunalore` (or any name you prefer)
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**: `echo "No build needed"` or leave empty
   - **Publish Directory**: `.` (dot/period - this means root directory)

6. **Click "Create Static Site"**

7. **Wait for Deployment**: Render will deploy your site automatically

## Important Notes:

- ✅ **Service Type**: Must be "Static Site" NOT "Web Service"
- ✅ **Build Command**: Can be empty or `echo "No build needed"`
- ✅ **Publish Directory**: `.` (root directory)
- ✅ `package.json` is included to prevent npm errors (but no build is needed)
- ✅ All files are served directly from the root directory

## After Deployment:

Your site will be available at: `https://lunalore.onrender.com` (or your custom domain if configured)

## Troubleshooting:

**If you still see npm errors:**
1. **Delete the service** and create a new one
2. Make sure you selected **"Static Site"** not "Web Service"
3. Verify Build Command is empty or just `echo "No build needed"`
4. Verify Publish Directory is `.` (dot)
5. The `package.json` file is now included to prevent npm errors

**Common mistake**: Creating a "Web Service" instead of "Static Site" - this will always try to run npm!

