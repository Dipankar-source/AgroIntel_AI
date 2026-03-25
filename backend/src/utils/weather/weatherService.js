const Weather = require('../../models/Weather/weatherData');
const mongoose = require('mongoose');

/**
 * Service for managing weather data and history
 */

/**
 * Store weather data with automatic 7-day expiry
 */
async function storeWeatherData(userId, weatherData) {
    try {
        const record = new Weather({
            userId,
            ...weatherData,
            recordedAt: new Date()
        });

        return await record.save();
    } catch (error) {
        console.error('Error storing weather data:', error);
        throw error;
    }
}

/**
 * Get weather data for analysis
 */
async function getWeatherForAnalysis(userId, days = 7) {
    try {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return await Weather.find({
            userId,
            recordedAt: { $gte: startDate }
        }).sort({ recordedAt: -1 });
    } catch (error) {
        console.error('Error fetching weather for analysis:', error);
        throw error;
    }
}

/**
 * Get daily average weather
 */
async function getDailyAverageWeather(userId, days = 7) {
    try {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return await Weather.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    recordedAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' }
                    },
                    avgTemp: { $avg: '$temperature' },
                    maxTemp: { $max: '$tempMax' },
                    minTemp: { $min: '$tempMin' },
                    avgHumidity: { $avg: '$humidity' },
                    avgWindSpeed: { $avg: '$windSpeed' },
                    totalRainfall: { $sum: '$rainfall' },
                    recordCount: { $sum: 1 },
                    mostCommonCondition: { $first: '$weatherCondition.main' }
                }
            },
            {
                $sort: { _id: -1 }
            }
        ]);
    } catch (error) {
        console.error('Error calculating daily averages:', error);
        throw error;
    }
}

/**
 * Get weather trend analysis
 */
async function getWeatherTrend(userId, days = 7) {
    try {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const weatherData = await Weather.find({
            userId,
            recordedAt: { $gte: startDate }
        }).sort({ recordedAt: 1 });

        if (!weatherData || weatherData.length === 0) {
            return null;
        }

        const temperatures = weatherData.map(w => w.temperature);
        const humidity = weatherData.map(w => w.humidity);
        const windSpeed = weatherData.map(w => w.windSpeed);

        return {
            tempTrend: calculateTrend(temperatures),
            humidityTrend: calculateTrend(humidity),
            windTrend: calculateTrend(windSpeed),
            dataPoints: weatherData.length,
            analysisPeriod: `${days} days`
        };
    } catch (error) {
        console.error('Error calculating trend:', error);
        throw error;
    }
}

/**
 * Helper function to calculate trend (increasing, decreasing, stable)
 */
function calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b) / secondHalf.length;

    const difference = avgSecond - avgFirst;
    const changePercent = (difference / avgFirst) * 100;

    if (Math.abs(changePercent) < 5) {
        return { status: 'stable', changePercent: changePercent.toFixed(2) };
    } else if (changePercent > 0) {
        return { status: 'increasing', changePercent: changePercent.toFixed(2) };
    } else {
        return { status: 'decreasing', changePercent: changePercent.toFixed(2) };
    }
}

/**
 * Check if location has changed significantly
 */
async function hasLocationChanged(userId, newLocation) {
    try {
        const lastRecord = await Weather.findOne({ userId }).sort({ recordedAt: -1 });

        if (!lastRecord) {
            return true; // First record
        }

        const lastLocation = lastRecord.location;
        const distance = calculateDistance(
            lastLocation.latitude,
            lastLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
        );

        // Consider location changed if more than 1 km apart
        return distance > 1;
    } catch (error) {
        console.error('Error checking location change:', error);
        return true;
    }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in km
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

/**
 * Get weather alert based on conditions
 */
async function generateWeatherAlerts(userId) {
    try {
        const currentWeather = await Weather.findOne({ userId }).sort({ recordedAt: -1 });

        if (!currentWeather) {
            return [];
        }

        const alerts = [];

        // Check for extreme temperature
        if (currentWeather.temperature > 40) {
            alerts.push({
                type: 'extreme_heat',
                message: 'High temperature alert. Ensure proper irrigation.',
                severity: 'high',
                temperature: currentWeather.temperature
            });
        } else if (currentWeather.temperature < 0) {
            alerts.push({
                type: 'frost',
                message: 'Frost alert. Protect crops from freezing temperatures.',
                severity: 'high',
                temperature: currentWeather.temperature
            });
        }

        // Check for heavy rain
        if (currentWeather.rainProbability > 80) {
            alerts.push({
                type: 'heavy_rain',
                message: 'Heavy rainfall expected. Check drainage systems.',
                severity: 'medium',
                rainProbability: currentWeather.rainProbability
            });
        }

        // Check for high humidity (disease risk)
        if (currentWeather.humidity > 85) {
            alerts.push({
                type: 'high_humidity',
                message: 'High humidity. Increase vigilance for fungal diseases.',
                severity: 'medium',
                humidity: currentWeather.humidity
            });
        }

        // Check for strong winds
        if (currentWeather.windSpeed > 40) {
            alerts.push({
                type: 'strong_winds',
                message: 'Strong winds detected. Secure loose items and support plants.',
                severity: 'medium',
                windSpeed: currentWeather.windSpeed
            });
        }

        return alerts;
    } catch (error) {
        console.error('Error generating weather alerts:', error);
        return [];
    }
}

module.exports = {
    storeWeatherData,
    getWeatherForAnalysis,
    getDailyAverageWeather,
    getWeatherTrend,
    hasLocationChanged,
    calculateDistance,
    generateWeatherAlerts
};
