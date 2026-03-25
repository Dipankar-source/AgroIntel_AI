const express = require('express');
const getCurrentUser = require('../../controllers/UserController/getCurrentUser');
const { upload, handleMulterError } = require('../../middlewares/upload');
const isAuth = require('../../middlewares/isAuth');
const {
  uploadDocuments,
  getDocuments,
  deleteDocument,
  applyParsedData,
  getFarmerPoints,
} = require('../../controllers/UserController/documentController');
const {
  uploadProfileImage,
  removeProfileImage,
  updateCurrentUser,
} = require('../../controllers/UserController/profileController');

const router = express.Router();

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get current user profile - protected route
router.get('/currentuser', isAuth, asyncHandler(getCurrentUser));

// Profile image routes
router.post(
  '/upload-profile-image',
  isAuth,
  upload.single('profileImage'),
  handleMulterError,
  asyncHandler(uploadProfileImage),
);
router.delete('/profile-image', isAuth, asyncHandler(removeProfileImage));

// Update user profile information
router.put('/currentuser', isAuth, asyncHandler(updateCurrentUser));

// Documents: upload, list, delete
// ⚠️ IMPORTANT: More specific routes BEFORE generic :id routes!
router.post('/documents/apply-parsed', isAuth, asyncHandler(applyParsedData));
router.post(
  '/documents',
  isAuth,
  upload.array('documents', 10),
  handleMulterError,
  asyncHandler(uploadDocuments),
);
router.get('/documents', isAuth, asyncHandler(getDocuments));
router.delete('/documents/:id', isAuth, asyncHandler(deleteDocument));

// Farmer Points route
router.get('/farmer-points', isAuth, asyncHandler(getFarmerPoints));

// Delete account - permanently removes user and all their data
router.delete('/account', isAuth, asyncHandler(async (req, res) => {
  try {
    const User = require('../../models/User/userData');
    const { deleteFile } = require('../../utils/fileUpload/fileUpload');

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    // Delete uploaded files from ImageKit (best-effort)
    const allDocs = [
      ...(user.documents || []),
      ...(user.identityDocuments || []),
    ];
    for (const doc of allDocs) {
      if (doc.publicId) {
        try { await deleteFile(doc.publicId); } catch (e) { /* continue */ }
      }
    }
    if (user.profilePicture?.publicId) {
      try { await deleteFile(user.profilePicture.publicId); } catch (e) { /* continue */ }
    }

    // Delete user from database
    await User.findByIdAndDelete(req.userId);

    // Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    return res.status(200).json({ success: true, msg: 'Account deleted successfully' });
  } catch (error) {
    console.error('DELETE_ACCOUNT_ERROR:', error);
    return res.status(500).json({ success: false, msg: 'Failed to delete account' });
  }
}));

module.exports = router;