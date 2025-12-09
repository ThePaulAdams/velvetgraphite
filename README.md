# VelvetGraphite Art Gallery

An art gallery website to showcase artwork with tagging and filtering capabilities.

## Tech Stack

- **Backend**: Strapi CMS (Node.js)
- **Frontend**: Next.js 14
- **Database**: PostgreSQL (Railway)
- **Image Storage**: Cloudinary
- **Hosting**: Railway

## Features

- Upload and manage artwork through Strapi admin panel
- Tag-based organization and filtering
- Search artwork by tags
- Responsive gallery layout
- Optimized image delivery via Cloudinary

## Project Structure

```
velvetgraphite/
├── backend/          # Strapi CMS
└── frontend/         # Next.js Gallery
```

## Setup

### Prerequisites
- Node.js 20.x or 22.x
- PostgreSQL database
- Cloudinary account

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://...
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_KEY=your_api_key
CLOUDINARY_SECRET=your_api_secret
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_STRAPI_URL=your_strapi_url
```

## Development

Coming soon...

## Deployment on Railway

1. Connect this repository to Railway
2. Create PostgreSQL database
3. Configure environment variables
4. Deploy!
