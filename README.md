# Hospitality Hire Hub

A comprehensive global hospitality career and recruitment platform connecting job seekers, employers, and consultation clients.

## Features

### For Job Seekers
- Create professional profiles with CV upload
- Browse and apply for hospitality jobs worldwide
- Save favorite job listings
- Access learning resources (articles, videos, ebooks, audio)
- Take certification interviews for different departments
- Track application status
- Join community discussions

### For Employers
- Post job listings with detailed requirements
- Search and filter candidate database
- Manage job applications
- View candidate profiles and CVs
- Company profile management
- Track job posting performance

### For Consultation Clients
- Book consultations with industry experts
- Career guidance and coaching sessions
- Resume review services
- Interview preparation

### For Admins
- User management
- Job listing moderation
- Payment tracking
- Content management (resources, gallery, testimonials, FAQs)
- Community moderation
- Analytics dashboard

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- shadcn/ui components
- React Query for state management
- React Router for navigation

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for file uploads
- Paystack API for payments

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Cloudinary account
- Paystack account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd hospitality-hire-hub
```

2. Install frontend dependencies
```bash
cd app
npm install
```

3. Install backend dependencies
```bash
cd ../backend
npm install
```

4. Set up environment variables

Create `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hospitality_hire_hub
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key

FRONTEND_URL=http://localhost:5173
```

Create `.env` file in the app directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

5. Start the development servers

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd app
npm run dev
```

## Deployment

### Frontend (Vercel/Netlify)
1. Connect your repository to Vercel or Netlify
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables

### Backend (Render/Railway)
1. Connect your repository
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

## Project Structure

```
├── app/                    # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Page layouts
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   │   ├── admin/      # Admin dashboard pages
│   │   │   └── dashboard/  # User dashboard pages
│   │   └── App.tsx         # Main app component
│   └── package.json
│
├── backend/                # Backend Node.js application
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── server.js           # Main server file
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Jobs
- `GET /api/v1/jobs` - Get all jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs` - Create new job (employer)
- `PATCH /api/v1/jobs/:id/status` - Update job status
- `POST /api/v1/jobs/:id/apply` - Apply for job

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update profile
- `GET /api/v1/users/candidates` - Search candidates

### Admin
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/jobs` - Get all jobs
- `GET /api/v1/admin/payments` - Get all payments
- `GET /api/v1/admin/analytics` - Get platform analytics

## Payment Methods

- **Paystack**: Card payments, bank transfers, USSD, mobile money
- **USDT (TRC20)**: Cryptocurrency payments
- **Bank Transfer**: Direct bank transfers with manual verification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@hospitalityhirehub.com or join our community forum.
