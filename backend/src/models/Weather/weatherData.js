const mongoose = require('mongoose');

// Weather History Schema - stores weather data with location for analysis
const weatherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Location Information
    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        address: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        country: {
            type: String,
            default: 'India'
        },
        zipcode: {
            type: String
        }
    },
    
    // Current Weather Data
    temperature: {
        type: Number,
        required: true
    },
    feelsLike: {
        type: Number
    },
    tempMin: {
        type: Number
    },
    tempMax: {
        type: Number
    },
    
    // Atmospheric Data
    humidity: {
        type: Number,
        required: true
    },
    pressure: {
        type: Number
    },
    windSpeed: {
        type: Number,
        required: true
    },
    windDegree: {
        type: Number
    },
    cloudCoverage: {
        type: Number
    },
    visibility: {
        type: Number
    },
    uvIndex: {
        type: Number
    },
    
    // Precipitation Data
    rainfall: {
        type: Number,
        default: 0
    },
    rainProbability: {
        type: Number
    },
    
    // Weather Condition
    weatherCondition: {
        main: {
            type: String,
            required: true
        },
        description: {
            type: String
        },
        icon: {
            type: String
        }
    },
    
    // Additional Data
    sunrise: {
        type: Date
    },
    sunset: {
        type: Date
    },
    
    // Timestamps
    recordedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // Automatically delete documents after 7 days
        expires: 604800 // 7 days in seconds
    }
});

// Compound index for faster queries
weatherSchema.index({ userId: 1, recordedAt: -1 });
weatherSchema.index({ userId: 1, createdAt: -1 });

// Model
const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
