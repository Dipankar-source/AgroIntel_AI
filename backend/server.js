require('dotenv').config();
const cookieParser = require('cookie-parser')
const cors = require('cors')
const express = require('express');

const app = express();

const databaseConnect = require('./src/config/db');
const authRoute = require('./src/routers/AuthRoute/AuthRoute');
const userRoute = require('./src/routers/UserRoute/getCurrentUserRoute');
const billingRoute = require('./src/routers/BillingRoute/billingRoute');
const notificationRoute = require('./src/routers/NotificationRoute/notificationRoute');
const weatherRoute = require('./src/routers/WeatherRoute/weatherRoute');
const PORT = process.env.PORT || 4000;

// Global error handlers - ADD THIS AT THE VERY TOP
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION:', error);
    console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser())

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/auth", authRoute);
app.use('/api/user', userRoute);
app.use('/api/billing', billingRoute);
app.use('/api/notifications', notificationRoute);
app.use('/api/weather', weatherRoute);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
        success: false,
        message: error.message || 'Internal server error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});



// DB Connection + Server Start
databaseConnect()
    .then(() => {
        const server = app.listen(PORT, () => {
            console.log(`✅ Server is running on: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
        process.exit(1);
    });