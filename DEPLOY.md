# Deploy LunaLore to Render

## Steps to Deploy:

1. **Go to Render Dashboard**: https://dashboard.render.com/

2. **Create New Static Site**:
   - Click "New +" button
   - Select "Static Site"

3. **Connect Repository**:
   - Connect your GitHub account if not already connected
   - Select repository: `akshayapiri/lunalore`

4. **Configure Settings**:
   - **Name**: `lunalore` (or any name you prefer)
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or use `.`)
   - **Build Command**: **Leave EMPTY** (this is important - no build needed!)
   - **Publish Directory**: **Leave EMPTY** or use `.` (root directory)

5. **Click "Create Static Site"**

6. **Wait for Deployment**: Render will deploy your site automatically

## Important Notes:

- ✅ **Build Command**: Must be EMPTY (no npm, no build process)
- ✅ **Publish Directory**: Empty or `.` (root)
- ✅ This is a pure static site - no package.json needed
- ✅ All files are served directly from the root directory

## After Deployment:

Your site will be available at: `https://lunalore.onrender.com` (or your custom domain if configured)

## Troubleshooting:

If you see npm errors:
- Make sure "Build Command" is **completely empty**
- Make sure you selected "Static Site" not "Web Service"
- The site should deploy without any build process

