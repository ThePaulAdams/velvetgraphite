# VelvetGraphite - Deployment Guide

This guide will walk you through deploying VelvetGraphite to Railway.

## Prerequisites

- [Railway account](https://railway.app)
- [AWS account](https://aws.amazon.com) (free tier includes 5GB S3 storage for 12 months)
- GitHub repository connected to Railway

## Step 1: Set up AWS S3

1. Sign up for an AWS account at https://aws.amazon.com (if you don't have one)
2. Go to the AWS S3 Console: https://s3.console.aws.amazon.com/
3. Create a new S3 bucket:
   - Click "Create bucket"
   - **Bucket name**: Choose a unique name (e.g., `velvetgraphite-art-gallery`)
   - **Region**: Choose your preferred region (e.g., `us-east-1`)
   - **Block Public Access settings**: Uncheck "Block all public access"
     - Check the acknowledgment box (your uploaded images need to be publicly accessible)
   - Leave other settings as default
   - Click "Create bucket"
4. Configure bucket permissions:
   - Click on your newly created bucket
   - Go to the "Permissions" tab
   - Scroll to "Bucket policy" and click "Edit"
   - Add this policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
       }
     ]
   }
   ```
   - Click "Save changes"
5. Create IAM credentials:
   - Go to IAM Console: https://console.aws.amazon.com/iam/
   - Click "Users" → "Create user"
   - **User name**: `velvetgraphite-uploader`
   - Click "Next"
   - Select "Attach policies directly"
   - Search for and select "AmazonS3FullAccess" (or create a custom policy with only your bucket access)
   - Click "Next" → "Create user"
   - Click on the created user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT**: Save these credentials (you won't see them again):
     - Access Key ID
     - Secret Access Key

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

1. In Railway, click "New" → "GitHub Repo"
2. Select your `velvetgraphite` repository
3. Railway will create a service. Click on the service.
4. Go to **Settings** → **General**
5. Set **Root Directory** to: `backend`
6. Set **Build Command** to: `npm install && npm run build`
7. Set **Start Command** to: `npm run start`
8. Configure environment variables for the backend service:

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

# AWS S3 (from Step 1)
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_ACCESS_SECRET=your-secret-access-key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=your-bucket-name
```

**To generate secure random strings:**
```bash
# Run this in your terminal 6 times to generate each secret:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

9. Click **Deploy** to start the backend deployment

## Step 5: Deploy Frontend (Next.js)

1. In Railway, click "New" → "GitHub Repo"
2. Select your `velvetgraphite` repository again
3. Railway will create another service. Click on it.
4. Go to **Settings** → **General**
5. Set **Root Directory** to: `frontend`
6. Set **Build Command** to: `npm install && npm run build`
7. Set **Start Command** to: `npm run start`
8. Configure environment variables for the frontend service:

```bash
# Point to your Railway backend URL
NEXT_PUBLIC_STRAPI_URL=https://your-backend-service.railway.app
```

**Note:** Replace `your-backend-service.railway.app` with the actual URL of your deployed Strapi backend from Step 4.

9. Click **Deploy** to start the frontend deployment

**Important:** Railway provides each service with a unique URL. You can find the backend URL in the backend service settings under **Networking**.

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
   - **Image**: Upload your artwork (will be stored in AWS S3)
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
| `AWS_ACCESS_KEY_ID` | AWS access key ID | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_ACCESS_SECRET` | AWS secret access key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | AWS S3 region | `us-east-1` |
| `AWS_BUCKET_NAME` | S3 bucket name | `velvetgraphite-art-gallery` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `1337` |

### Frontend Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRAPI_URL` | Backend API URL | `https://your-backend.railway.app` |

## Troubleshooting

### Images not loading
- Check that AWS S3 credentials are correct in backend env vars
- Verify that your S3 bucket has the correct public access policy
- Verify that `NEXT_PUBLIC_STRAPI_URL` in frontend points to the correct backend URL
- Check browser console for CORS errors or 403 errors (permission denied)

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
