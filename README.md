# VelvetGraphite Art Gallery

A beautiful, modern art gallery website to showcase artwork with advanced tagging and filtering capabilities. Built specifically for displaying artwork inspired by Reddit's creative community.

## Features

- 🎨 **Admin Panel**: Easy-to-use Strapi CMS for managing artwork
- 🖼️ **Gallery View**: Responsive grid layout with stunning visuals
- 🏷️ **Smart Tagging**: Organize and filter artwork by custom tags
- 🔍 **Search**: Quick filtering by tags (e.g., "cutepillow", "redhead")
- ☁️ **Cloud Storage**: Automatic image optimization via Cloudinary
- 📱 **Responsive**: Works beautifully on mobile, tablet, and desktop
- ⚡ **Fast**: Optimized with Next.js 16 and server-side rendering

## Tech Stack

- **Backend**: Strapi v5 (Headless CMS)
- **Frontend**: Next.js 16 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Railway)
- **Image Storage**: Cloudinary
- **Hosting**: Railway

## Project Structure

```
velvetgraphite/
├── backend/              # Strapi CMS backend
│   ├── config/           # Database, server, plugins config
│   ├── src/
│   │   └── api/
│   │       └── artwork/  # Artwork content type
│   └── public/
├── frontend/             # Next.js frontend
│   ├── app/
│   │   ├── gallery/      # Gallery pages
│   │   └── page.tsx      # Landing page
│   ├── components/       # React components
│   └── lib/              # API utilities and types
└── DEPLOYMENT.md         # Deployment guide
```

## Quick Start

### Prerequisites
- Node.js 20.x - 24.x
- npm or yarn
- PostgreSQL database (for production)
- Cloudinary account (free tier)

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/ThePaulAdams/velvetgraphite.git
cd velvetgraphite
```

2. **Set up Backend (Strapi)**
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your local settings

# Start Strapi in development mode
npm run develop
```

Access Strapi admin at: http://localhost:1337/admin

Create your first admin account when prompted.

3. **Set up Frontend (Next.js)**
```bash
cd frontend
npm install

# Copy environment variables
cp .env.local.example .env.local
# Edit .env.local to point to your Strapi backend

# Start Next.js development server
npm run dev
```

Access the gallery at: http://localhost:3000

## Deployment to Railway

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Railway Setup:

1. Create a Railway project from your GitHub repository
2. Add PostgreSQL database
3. Deploy backend with environment variables
4. Deploy frontend with `NEXT_PUBLIC_STRAPI_URL`
5. Configure Strapi permissions and start uploading artwork!

## Usage

### Adding Artwork

1. Go to Strapi admin panel
2. Navigate to Content Manager → Artwork → Create new entry
3. Fill in the details:
   - **Title**: Name of the artwork
   - **Description**: Optional description
   - **Image**: Upload your artwork (stored in Cloudinary)
   - **Tags**: Add tags as JSON array: `["tag1", "tag2", "tag3"]`
   - **Reddit Username**: Subject's username (optional)
   - **Reddit Post URL**: Link to original post (optional)
   - **Date Drawn**: Creation date
4. Save and Publish

### Filtering by Tags

- Users can click any tag in the gallery to filter artworks
- The "All" button shows all artworks
- Tags are extracted automatically from all artworks

## Environment Variables

### Backend
```env
DATABASE_CLIENT=postgres
DATABASE_URL=postgresql://...
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-salt
ADMIN_JWT_SECRET=your-secret
TRANSFER_TOKEN_SALT=your-salt
JWT_SECRET=your-secret
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_KEY=your-cloudinary-key
CLOUDINARY_SECRET=your-cloudinary-secret
```

### Frontend
```env
NEXT_PUBLIC_STRAPI_URL=https://your-backend-url.railway.app
```

## Features in Detail

### Artwork Content Type
Each artwork includes:
- Title and description
- High-quality image (via Cloudinary)
- Multiple tags for categorization
- Reddit username and post URL reference
- Date drawn
- Featured flag
- View counter
- Publish/draft status

### Gallery Features
- Responsive grid layout (1-4 columns based on screen size)
- Hover effects and smooth transitions
- Tag filtering with live updates
- Individual artwork detail pages
- Beautiful gradient theme
- Mobile-optimized

## Contributing

This project was created for personal use. Feel free to fork and adapt for your own needs!

## License

MIT

## Acknowledgments

- Built with [Strapi](https://strapi.io)
- Powered by [Next.js](https://nextjs.org)
- Images hosted on [Cloudinary](https://cloudinary.com)
- Deployed on [Railway](https://railway.app)
