const Weather = require('../../models/Weather/weatherData');
const mongoose = require('mongoose');

/**
 * Store weather data for a user
 * @route POST /api/weather/update
 */
exports.updateWeather = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const {
            temperature,
            feelsLike,
            tempMin,
            tempMax,
            humidity,
            pressure,
            windSpeed,
            windDegree,
            cloudCoverage,
            visibility,
            uvIndex,
            rainfall,
            rainProbability,
            weatherCondition,
            sunrise,
            sunset,
            location
        } = req.body;

        // Validate required fields
        if (!temperature || !humidity || !windSpeed || !weatherCondition) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: temperature, humidity, windSpeed, weatherCondition'
            });
        }

        if (!location || !location.latitude || !location.longitude) {
            return res.status(400).json({
                success: false,
                message: 'Location with latitude and longitude is required'
            });
        }

        // Create new weather record
        const weatherRecord = new Weather({
            userId,
            temperature,
            feelsLike,
            tempMin,
            tempMax,
            humidity,
            pressure,
            windSpeed,
            windDegree,
            cloudCoverage,
            visibility,
            uvIndex,
            rainfall,
            rainProbability,
            weatherCondition,
            sunrise: sunrise ? new Date(sunrise) : undefined,
            sunset: sunset ? new Date(sunset) : undefined,
            location,
            recordedAt: new Date()
        });

        const savedWeather = await weatherRecord.save();

        return res.status(201).json({
            success: true,
            message: 'Weather data recorded successfully',
            data: savedWeather
        });

    } catch (error) {
        console.error('Error updating weather:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update weather',
            error: error.message
        });
    }
};

/**
 * Get current weather for user
 * @route GET /api/weather/current
 */
exports.getCurrentWeather = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const currentWeather = await Weather.findOne({ userId })
            .sort({ recordedAt: -1 })
            .lean();

        if (!currentWeather) {
            return res.status(404).json({
                success: false,
                message: 'No weather data found'
            });
        }

        return res.status(200).json({
            success: true,
            data: currentWeather
        });

    } catch (error) {
        console.error('Error fetching current weather:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather',
            error: error.message
        });
    }
};

/**
 * Get weather history for last 7 days
 * @route GET /api/weather/history
 */
exports.getWeatherHistory = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const weatherHistory = await Weather.find({
            userId,
            recordedAt: { $gte: sevenDaysAgo }
        })
            .sort({ recordedAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: weatherHistory.length,
            data: weatherHistory
        });

    } catch (error) {
        console.error('Error fetching weather history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather history',
            error: error.message
        });
    }
};

/**
 * Get weather statistics for last 7 days
 * @route GET /api/weather/statistics
 */
exports.getWeatherStatistics = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const stats = await Weather.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    recordedAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    avgTemp: { $avg: '$temperature' },
                    maxTemp: { $max: '$tempMax' },
                    minTemp: { $min: '$tempMin' },
                    avgHumidity: { $avg: '$humidity' },
                    avgWindSpeed: { $avg: '$windSpeed' },
                    totalRainfall: { $sum: '$rainfall' },
                    recordCount: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            data: stats.length > 0 ? stats[0] : {}
        });

    } catch (error) {
        console.error('Error calculating statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to calculate statistics',
            error: error.message
        });
    }
};

/**
 * Get weather by date range
 * @route GET /api/weather/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
exports.getWeatherByDateRange = async (req, res) => {
    try {
        const userId = req.user?.id || req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'startDate and endDate query parameters are required'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const weatherData = await Weather.find({
            userId,
            recordedAt: { $gte: start, $lte: end }
        })
            .sort({ recordedAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: weatherData.length,
            startDate: start,
            endDate: end,
            data: weatherData
        });

    } catch (error) {
        console.error('Error fetching weather by date range:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch weather data',
            error: error.message
        });
    }
};
