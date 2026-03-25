const express = require("express");
const isAuth = require("../../middlewares/isAuth");
const {
  getNotifications,
  markNotificationRead,
  markAllRead,
} = require("../../controllers/NotificationController/notificationController");

const router = express.Router();

router.get("/", isAuth, getNotifications);
router.patch("/read-all", isAuth, markAllRead);
router.patch("/:id/read", isAuth, markNotificationRead);

module.exports = router;

