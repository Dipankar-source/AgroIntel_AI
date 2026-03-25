const Notification = require("../../models/Notification/notification");

const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const unreadOnlyRaw = req.query.unreadOnly;
    const unreadOnly = unreadOnlyRaw === "true" || unreadOnlyRaw === true;
    const limit = Math.min(parseInt(req.query.limit || "20", 10) || 20, 100);

    const filter = { userId };
    if (unreadOnly) filter.readAt = null;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({ userId, readAt: null }),
    ]);

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("GET_NOTIFICATIONS_ERROR:", error);
    return res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const updated = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { readAt: new Date() } },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ success: false, msg: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification: updated });
  } catch (error) {
    console.error("MARK_NOTIFICATION_READ_ERROR:", error);
    return res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const result = await Notification.updateMany(
      { userId, readAt: null },
      { $set: { readAt: now } }
    );

    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
    });
  } catch (error) {
    console.error("MARK_ALL_NOTIFICATIONS_READ_ERROR:", error);
    return res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

const createNotification = async (req, res) => {
  try {
    const userId = req.userId;
    const { title, message, type } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        msg: "title and message are required",
      });
    }

    const notif = await Notification.create({
      userId,
      title,
      message,
      type: type || "general",
    });

    return res.status(201).json({
      success: true,
      notification: notif,
    });
  } catch (error) {
    console.error("CREATE_NOTIFICATION_ERROR:", error);
    return res.status(500).json({ success: false, msg: "Internal Server Error" });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllRead,
  createNotification,
};

