# Vercel Deployment Guide for Edu CS Platform

This guide will walk you through deploying your Edu CS Platform to Vercel. The platform consists of two parts:
1. The backend (server) - A Node.js Express API
2. The frontend (client) - A React application built with Vite

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Cloudinary account](https://cloudinary.com/users/register/free) for file storage
3. Your MongoDB Atlas connection string

## Step 1: Configure Cloudinary

1. Sign up for a Cloudinary account if you don't have one
2. From your Cloudinary dashboard, note down:
   - Cloud name
   - API Key
   - API Secret

3. Update these values in your server's `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

## Step 2: Deploy the Backend (Server)

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Navigate to your server directory:
   ```
   cd server
   ```

3. Login to Vercel:
   ```
   vercel login
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project's name? edu-cs-platform
   - In which directory is your code located? ./
   - Want to override settings? Yes
   - Which settings would you like to override?
     - Build Command: npm install
     - Output Directory: ./
     - Development Command: npm start

6. Set up environment variables in the Vercel dashboard:
   - Go to your project in the Vercel dashboard
   - Click on "Settings" > "Environment Variables"
   - Add the following variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `JWT_EXPIRE`: 30d
     - `NODE_ENV`: production
     - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
     - `CLOUDINARY_API_KEY`: Your Cloudinary API key
     - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
     - `FRONTEND_URL`: Your frontend URL (e.g., https://edu-cs-platform-client.vercel.app)

7. Redeploy with the environment variables:
   ```
   vercel --prod
   ```

8. Note the deployment URL (e.g., https://edu-cs-platform.vercel.app)

## Step 3: Deploy the Frontend (Client)

1. Update the production environment file:
   - Open `client/.env.production`
   - Set `VITE_REACT_APP_BACKEND_BASEURL` to your backend URL (e.g., https://edu-cs-platform.vercel.app)

2. Navigate to your client directory:
   ```
   cd ../client
   ```

3. Deploy to Vercel:
   ```
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? Yes
   - Which scope? (Select your account)
   - Link to existing project? No
   - What's your project's name? edu-cs-platform-client
   - In which directory is your code located? ./
   - Want to override settings? Yes
   - Which settings would you like to override?
     - Build Command: npm run build
     - Output Directory: dist
     - Development Command: npm run dev

5. Set up environment variables in the Vercel dashboard:
   - Go to your project in the Vercel dashboard
   - Click on "Settings" > "Environment Variables"
   - Add the following variables:
     - `VITE_REACT_APP_BACKEND_BASEURL`: Your backend URL (e.g., https://edu-cs-platform.vercel.app)

6. Redeploy with the environment variables:
   ```
   vercel --prod
   ```

7. Note the deployment URL (e.g., https://edu-cs-platform-client.vercel.app)

## Step 4: Test Your Deployment

1. Visit your frontend URL (e.g., https://edu-cs-platform-client.vercel.app)
2. Test user registration and login
3. Test file uploads and downloads
4. Test all other functionality

## Troubleshooting

### CORS Issues
If you encounter CORS issues, make sure your backend's CORS configuration includes your frontend domain. The application is configured to use the `FRONTEND_URL` environment variable, so make sure it's set correctly in your Vercel environment variables.

```javascript
// The server is configured to use the FRONTEND_URL environment variable
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: [
    frontendUrl,
    'http://localhost:5174',
    'https://edu-cs-platform.vercel.app',
    'https://edu-cs-platform-client.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### File Upload Issues
If file uploads aren't working:
1. Check your Cloudinary credentials
2. Verify that the `NODE_ENV` is set to `production` in your Vercel environment variables
3. Check the server logs in the Vercel dashboard

### Database Connection Issues
If you can't connect to the database:
1. Make sure your MongoDB Atlas IP whitelist includes Vercel's IPs (or set it to allow all IPs)
2. Verify your connection string in the environment variables

## Maintenance

### Updating Your Deployment
When you make changes to your code:

1. Push your changes to your repository
2. Redeploy using the Vercel CLI:
   ```
   vercel --prod
   ```

### Monitoring
Use the Vercel dashboard to:
- Monitor deployments
- View logs
- Check performance metrics
- Set up alerts

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
