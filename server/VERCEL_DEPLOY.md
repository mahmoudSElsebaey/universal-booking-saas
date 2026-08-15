# Deploy Bookora API on Vercel

## Important limits
- Vercel runs **serverless functions** (not a 24/7 Node process).
- Local disk uploads do **not** persist — use **Cloudinary** (already integrated).
- Hobby plan: ~10s function timeout; Pro: higher.
- Prefer Railway/Render for long-running jobs; Vercel is OK for this REST API.

## Steps
1. Push repo to GitHub
2. Vercel → New Project → import repo
3. Root Directory: **server**
4. Framework: Other
5. Install: `npm install`
6. Build: leave empty or `echo skip`
7. Output: leave empty
8. Add Environment Variables (Production)
9. Deploy
10. Test `https://YOUR-API.vercel.app/api/v1/health`
