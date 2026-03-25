const express = require('express');
const router = express.Router();
const {
    updateWeather,
    getCurrentWeather,
    getWeatherHistory,
    getWeatherStatistics,
    getWeatherByDateRange
} = require('../../controllers/WeatherController/weatherController');
const isAuth = require('../../middlewares/isAuth');

/**
 * @route POST /api/weather/update
 * @description Store weather data with location information
 * @access Private
 */
router.post('/update', isAuth, updateWeather);

/**
 * @route GET /api/weather/current
 * @description Get the most recent weather data
 * @access Private
 */
router.get('/current', isAuth, getCurrentWeather);

/**
 * @route GET /api/weather/history
 * @description Get last 7 days weather history
 * @access Private
 */
router.get('/history', isAuth, getWeatherHistory);

/**
 * @route GET /api/weather/statistics
 * @description Get weather statistics for last 7 days
 * @access Private
 */
router.get('/statistics', isAuth, getWeatherStatistics);

/**
 * @route GET /api/weather/range
 * @description Get weather data by date range
 * @query startDate - YYYY-MM-DD
 * @query endDate - YYYY-MM-DD
 * @access Private
 */
router.get('/range', isAuth, getWeatherByDateRange);

module.exports = router;
