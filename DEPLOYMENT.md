# VelvetGraphite - Deployment Guide

This guide will walk you through deploying VelvetGraphite to Railway.

## Prerequisites

- [Railway account](https://railway.app)
- [Cloudinary account](https://cloudinary.com) (free tier)
- GitHub repository connected to Railway

## Step 1: Set up Cloudinary

1. Sign up for a free Cloudinary account at https://cloudinary.com
2. Go to your Dashboard
3. Note down these values:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Create Railway Project

1. Go to [Railway](https://railway.app) and log in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your `velvetgraphite` repository
5. Railway will detect your project structure

## Step 3: Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will provision a PostgreSQL database
4. The `DATABASE_URL` will be automatically available to your services

## Step 4: Deploy Backend (Strapi)

1. In Railway, click "New" → "GitHub Repo" → Select `/backend` directory
2. Or use the Monorepo settings to point to the backend folder
3. Configure environment variables for the backend service:

```bash
# Database (automatically provided by Railway if PostgreSQL is added)
DATABASE_CLIENT=postgres
DATABASE_URL=${{Postgres.DATABASE_URL}}
DATABASE_SSL=false

# Generate secure random strings for these:
APP_KEYS=generateRandomString1,generateRandomString2
API_TOKEN_SALT=generateRandomString3
ADMIN_JWT_SECRET=generateRandomString4
TRANSFER_TOKEN_SALT=generateRandomString5
JWT_SECRET=generateRandomString6

# Server
HOST=0.0.0.0
PORT=1337

# Cloudinary (from Step 1)
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

**To generate secure random strings:**
```bash
# Run this in your terminal 6 times to generate each secret:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

4. Add build command: `npm run build`
5. Add start command: `npm run start`
6. Deploy!

## Step 5: Deploy Frontend (Next.js)

1. In Railway, click "New" → "GitHub Repo" → Select `/frontend` directory
2. Or configure monorepo settings for the frontend folder
3. Configure environment variables for the frontend service:

```bash
# Point to your Railway backend URL
NEXT_PUBLIC_STRAPI_URL=https://your-backend-service.railway.app
```

**Note:** Replace `your-backend-service.railway.app` with the actual URL of your deployed Strapi backend from Step 4.

4. Add build command: `npm run build`
5. Add start command: `npm run start`
6. Deploy!

## Step 6: Configure Strapi CORS

1. Once your backend is deployed, visit: `https://your-backend-service.railway.app/admin`
2. Create your admin account (first time only)
3. Go to Settings → API Tokens → Create new API token (if needed for frontend)
4. The CORS is already configured in the Strapi middleware to allow your frontend

## Step 7: Make Content Public

By default, Strapi content is private. To make artworks publicly accessible:

1. Go to Strapi admin: `https://your-backend-service.railway.app/admin`
2. Navigate to Settings → Users & Permissions Plugin → Roles → Public
3. Under Permissions, expand "Artwork"
4. Check these permissions:
   - `find` (to list all artworks)
   - `findOne` (to view individual artwork)
5. Click "Save"

## Step 8: Upload Your First Artwork

1. In Strapi admin, go to Content Manager → Artwork
2. Click "Create new entry"
3. Fill in the details:
   - **Title**: e.g., "Portrait Study"
   - **Description**: Optional description
   - **Image**: Upload your artwork (will be stored in Cloudinary)
   - **Tags**: Add tags as JSON array, e.g., `["portrait", "sketch", "redhead"]`
   - **Reddit Username**: e.g., "cutepillow"
   - **Reddit Post URL**: Optional link to source
   - **Date Drawn**: When you created it
4. Click "Save" and "Publish"

## Step 9: View Your Gallery

Visit your frontend URL: `https://your-frontend-service.railway.app`

You should now see your artwork in the gallery! 🎨

## Environment Variables Summary

### Backend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_CLIENT` | Database type | `postgres` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-provided by Railway |
| `APP_KEYS` | Strapi app keys | `random-string-1,random-string-2` |
| `API_TOKEN_SALT` | API token salt | `random-string` |
| `ADMIN_JWT_SECRET` | Admin JWT secret | `random-string` |
| `TRANSFER_TOKEN_SALT` | Transfer token salt | `random-string` |
| `JWT_SECRET` | JWT secret | `random-string` |
| `CLOUDINARY_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_SECRET` | Cloudinary API secret | `your-secret` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `1337` |

### Frontend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRAPI_URL` | Backend API URL | `https://your-backend.railway.app` |

## Troubleshooting

### Images not loading
- Check that Cloudinary credentials are correct in backend env vars
- Verify that `NEXT_PUBLIC_STRAPI_URL` in frontend points to the correct backend URL
- Check browser console for CORS errors

### Cannot create admin account
- Make sure backend is fully deployed and running
- Check Railway logs for any errors

### Content not showing in gallery
- Verify artwork is "Published" in Strapi (not just saved as draft)
- Check that Public role has `find` and `findOne` permissions for Artwork

### 404 errors
- Ensure both frontend and backend services are running
- Check that environment variables are set correctly

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local settings
npm run develop
```

Access Strapi admin at: http://localhost:1337/admin

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local
npm run dev
```

Access frontend at: http://localhost:3000

## Support

For issues or questions:
- Check Railway logs for error messages
- Review Strapi documentation: https://docs.strapi.io
- Review Next.js documentation: https://nextjs.org/docs
