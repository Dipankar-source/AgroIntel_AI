# AgroIntel-AI

AgroIntel-AI is an AI-powered platform designed to help farmers and agri-businesses make data-driven decisions. It provides actionable insights from soil analysis, weather data, crop planning, and market trends, all while ensuring user data privacy and security.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Overview](#api-overview)
- [Frontend Usage](#frontend-usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Features
- **User Authentication**: Secure registration, login, OTP verification, password reset, and profile management.
- **Soil Analysis**: Upload soil reports (PDFs), get AI-powered insights, and visualize soil health.
- **Crop Planner**: Personalized crop recommendations and seasonal planning based on soil and weather data.
- **Weather Intelligence**: Real-time and historical weather data, statistics, and forecasts.
- **Market Insights**: Commodity price trends and market analytics.
- **Billing & Subscription**: Secure payment integration and subscription management.
- **Notifications**: In-app notifications for important events and updates.
- **Data Privacy**: All user data is encrypted and never shared without consent.

---

## Tech Stack
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Multer, Razorpay, Nodemailer
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Axios, Lottie, Recharts
- **Other**: ESLint, dotenv, ImageKit, GSAP, Lucide Icons

---

## Project Structure
```
backend/
  server.js           # Express server entry
  package.json        # Backend dependencies & scripts
  src/
    config/           # DB & JWT config
    controllers/      # Route controllers (auth, billing, user, weather, etc.)
    middlewares/      # Auth, file upload, etc.
    models/           # Mongoose schemas
    routers/          # Express routers (API endpoints)
    utils/            # Utility functions (file upload, OTP, etc.)
frontend/
  src/
    App.jsx           # Main React app
    pages/            # Main pages (Home, Auth, SoilAnalysis, CropPlanner, etc.)
    components/       # UI components
    context/          # React context providers
    assets/           # Static assets
    i18n/             # Localization files
  public/             # Static files (Lottie, images)
  package.json        # Frontend dependencies & scripts
```

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### 1. Clone the repository
```sh
git clone <your-repo-url>
cd Product_2\ (AgroIntel-AI)
```

### 2. Backend Setup
```sh
cd backend
cp .env.example .env   # Create your .env file and fill in required values
npm install
npm run dev            # Starts backend with nodemon
```

### 3. Frontend Setup
```sh
cd ../frontend
cp .env.example .env   # Create your .env file and fill in required values
npm install
npm run dev            # Starts frontend on http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)
```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000
```

---

## Running the Project
- **Backend**: `npm run dev` (http://localhost:4000)
- **Frontend**: `npm run dev` (http://localhost:5173)

---

## API Overview
- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify-otp`, `/api/auth/forgot-password`, etc.
- **User**: `/api/user/currentuser`, `/api/user/documents`, `/api/user/farmer-points`, etc.
- **Billing**: `/api/billing/create-order`, `/api/billing/verify`
- **Notifications**: `/api/notifications/`
- **Weather**: `/api/weather/current`, `/api/weather/history`, `/api/weather/statistics`

All endpoints require authentication except registration, login, and password reset.

---

## Frontend Usage
- Visit `http://localhost:5173` after starting both servers.
- Register or log in to access features.
- Upload soil reports, view AI insights, plan crops, check weather, manage profile, and more.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)

---

## Contact
For support or business inquiries, contact the project maintainer.
