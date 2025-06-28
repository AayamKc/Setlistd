# Setlisd - Concert Discovery & Review Platform

A full-stack web application for discovering concerts, reading reviews, and sharing live music experiences.

## 🏗️ Architecture Overview

### Frontend (React + Vite)
- **Location**: `/client/`
- **Framework**: React 19 with Vite
- **Styling**: Custom CSS with responsive design
- **Authentication**: Supabase Auth
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend (Node.js + Express)
- **Location**: `/server/`
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Supabase Auth with custom middleware
- **External API**: SeatGeek API for concert data
- **Environment**: Node.js with dotenv

## 🗂️ Project Structure

```
Setlistd/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Header.jsx     # Navigation & auth
│   │   │   ├── LoginModal.jsx # Authentication modal
│   │   │   ├── ConcertCard.jsx # Concert display cards
│   │   │   ├── SearchBar.jsx  # Search & filtering
│   │   │   ├── Footer.jsx     # Footer with dev info
│   │   │   └── LandingPage.jsx # Main page layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication state
│   │   ├── utils/
│   │   │   ├── supabase.js    # Supabase client
│   │   │   └── api.js         # API utilities
│   │   ├── App.jsx            # Main app component
│   │   ├── App.css            # Global styles
│   │   └── main.jsx           # Entry point
│   ├── public/
│   │   └── placeholder-artist.jpg # Default artist image
│   ├── package.json
│   └── .env                   # Environment variables
└── server/                    # Express backend
    ├── config/
    │   ├── database.js        # MongoDB connection
    │   └── supabase.js        # Supabase server config
    ├── controllers/
    │   └── reviewController.js # Review business logic
    ├── middleware/
    │   └── authMiddleware.js  # Authentication middleware
    ├── models/
    │   ├── Event.js           # Event schema
    │   └── Review.js          # Review schema
    ├── routes/
    │   └── reviewRoutes.js    # Review API routes
    ├── server.js              # Main server file
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB instance
- Supabase account
- SeatGeek API credentials

### Environment Setup

#### Backend Environment (server/.env)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/setlistd

# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SeatGeek API
SEATGEEK_CLIENT_ID=your_seatgeek_client_id
SEATGEEK_CLIENT_SECRET=your_seatgeek_client_secret

# Server Configuration
PORT=3000
```

#### Frontend Environment (client/.env)
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000
```

⚠️ **Important**: Replace the placeholder values with your actual Supabase credentials. The app includes fallback handling for missing credentials but authentication features will be disabled.

### Installation & Setup

1. **Install Backend Dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Install Frontend Dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Start Backend Server**
   ```bash
   cd server
   npm run dev
   # Server runs on http://localhost:3000
   ```

4. **Start Frontend Development Server**
   ```bash
   cd client
   npm run dev
   # Client runs on http://localhost:5173
   ```

## 📊 Database Schema

### Event Model
```javascript
{
  seatgeekId: Number,        // Unique SeatGeek event ID
  title: String,             // Event title
  datetime_local: Date,      // Local event date/time
  datetime_utc: Date,        // UTC event date/time
  url: String,               // SeatGeek event URL
  venue: {                   // Venue information
    id: Number,
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    postal_code: String,
    location: { lat: Number, lon: Number }
  },
  performers: [Mixed],       // Artist/performer data
  stats: {                   // Pricing statistics
    lowest_price: Number,
    highest_price: Number,
    average_price: Number,
    median_price: Number
  },
  taxonomies: [Object],      // Event categorization
  averageRating: Number,     // Calculated average rating
  reviewCount: Number,       // Total review count
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  eventId: ObjectId,         // Reference to Event
  userId: ObjectId,          // Reference to User (from Supabase)
  rating: Number,            // 1-5 star rating
  reviewText: String,        // Review content
  createdAt: Date
}
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Events
- `GET /api/events` - Search SeatGeek events
- `GET /api/saved-events` - Get saved events with filtering
- `GET /api/saved-events/:id` - Get specific event
- `DELETE /api/saved-events/:id` - Delete saved event
- `GET /api/populate-concerts` - Populate database with diverse concerts
- `GET /api/clear-events` - Clear all events from database

### Reviews
- `POST /api/events/:eventId/reviews` - Create review (auth required)
- `GET /api/events/:eventId/reviews` - Get event reviews

## 🎨 Frontend Components

### Netflix-Inspired Design
- **Dark Theme**: Black (#141414) background with red (#e50914) accents
- **Full-width Layout**: Components utilize entire screen space
- **Horizontal Scrolling**: Concert cards scroll horizontally like Netflix
- **Glassmorphism Effects**: Backdrop blur and transparency throughout
- **Consistent Typography**: Helvetica Neue font family
- **Netflix Red**: Primary brand color (#e50914) for buttons and accents

### Header Component
- Fixed position header with backdrop blur
- "Setlisd" branding in Netflix red with glow effect
- User authentication status with red accent buttons
- Transparent overlay design

### LandingPage Component
- Netflix-style hero section with gradient overlay
- Full-screen immersive layout
- Horizontal scrolling concert rows
- Handles data fetching and state management
- Dark-themed pagination system

### SearchBar Component
- Dark glassmorphism search container
- Netflix-red accent buttons and focus states
- Advanced filtering with dark theme:
  - City and artist filters
  - Date range selectors
  - Price range inputs
- Collapsible filter panel with backdrop blur

### ConcertCard Component
- Netflix-style cards (300px width)
- Horizontal scrolling rows
- Hover effects with scale and glow
- Dark theme with red accent stars
- Displays:
  - Artist image with zoom effect on hover
  - Artist name and tour (with text overflow)
  - Venue and location
  - Date and time
  - Red star ratings
  - Price in Netflix red

### Footer Component
- Dark footer (#0f0f0f) with red accents
- Developer information (Aayam Kc) highlighted in red
- Contact email: kcaayam04@gmail.com in brand color
- Legal links with red hover states
- Data attribution

## 🔐 Authentication Flow

1. **Frontend Authentication**
   - Uses Supabase Auth for user management
   - AuthContext provides global auth state
   - JWT tokens stored in localStorage
   - Automatic token refresh

2. **Backend Authentication**
   - Custom middleware validates Supabase tokens
   - Protected routes require authentication
   - User data extracted from JWT payload

## 🛠️ Development Commands

### Backend
```bash
# Start development server
npm run dev

# Start production server
npm start

# Test authentication
npm run test:auth

# Check environment variables
npm run check:env
```

### Frontend
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🎯 Key Features

### Search & Discovery
- Real-time concert search via SeatGeek API
- Advanced filtering by location, date, price, artist
- Pagination for large result sets
- Responsive card-based layout

### User Authentication
- Secure signup/login with Supabase
- Protected routes and features
- Persistent authentication state
- Clean authentication UI

### Review System
- Star ratings (1-5 scale)
- Text reviews for events
- Average rating calculation
- Review count display

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly interfaces
- Accessible design patterns

## 🔄 Data Flow

1. **Concert Data**
   - Fetched from SeatGeek API
   - Stored in MongoDB for persistence
   - Enhanced with user reviews and ratings

2. **User Interactions**
   - Search queries sent to backend
   - Filters applied server-side
   - Results paginated and returned
   - Reviews submitted through authenticated API

3. **State Management**
   - Authentication state via React Context
   - Local component state for UI
   - Server state via API calls

## 🚦 Deployment Considerations

### Environment Variables
- Ensure all environment variables are set
- Use different Supabase projects for dev/prod
- Secure SeatGeek API credentials

### Database
- MongoDB connection string for production
- Ensure proper indexing for performance
- Regular backups recommended

### Frontend Build
- Build static assets: `npm run build`
- Serve from CDN or static hosting
- Configure proper routing for SPA

### Backend Deployment
- Process manager (PM2) recommended
- Environment-specific configurations
- SSL certificate for HTTPS
- Rate limiting for API endpoints

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is whitelisted in backend
   - Check CORS configuration in server.js

2. **Authentication Problems**
   - Verify Supabase configuration
   - Check JWT token validity
   - Ensure middleware is properly configured

3. **Database Connection**
   - Verify MongoDB connection string
   - Check network connectivity
   - Ensure proper database permissions

4. **SeatGeek API Issues**
   - Verify API credentials
   - Check rate limiting
   - Monitor API usage quotas

### Debug Commands
```bash
# Check server logs
cd server && npm run dev

# Test API endpoints
curl http://localhost:3000/api/events

# Check database connection
node server/config/database.js
```

## 🤝 Contributing

### Code Style
- Use ESLint configuration
- Follow React best practices
- Maintain consistent naming conventions
- Add comments for complex logic

### Git Workflow
- Create feature branches
- Write descriptive commit messages
- Test before committing
- Keep commits focused and atomic

## 📝 Notes

- The application uses Supabase for authentication but MongoDB for application data
- SeatGeek API provides concert data from multiple cities
- Reviews and ratings are stored locally in MongoDB
- The frontend is built with modern React patterns and hooks
- Responsive design works across all device sizes

## 📧 Contact

**Developer**: Aayam Kc  
**Email**: kcaayam04@gmail.com  
**Project**: Setlisd Concert Discovery Platform

---

*This documentation is comprehensive and should be updated as the application evolves.*