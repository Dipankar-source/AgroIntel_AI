const User = require("../../models/User/userData");
const { uploadFile, deleteFile } = require("../../utils/fileUpload/fileUpload");

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        msg: "No image file provided",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Delete old profile picture if exists
    if (user.profilePicture?.publicId) {
      try {
        await deleteFile(user.profilePicture.publicId);
      } catch (err) {
        console.error("Error deleting old profile image:", err);
      }
    }

    // Upload new profile picture
    const uploadedFile = await uploadFile(req.file, {
      category: "profile_image",
      userId: userId,
      isPublic: true,
    });

    // Store only the necessary info
    user.profilePicture = {
      url: uploadedFile.url,
      publicId: uploadedFile.publicId,
      fileName: uploadedFile.fileName,
      uploadedAt: new Date(),
    };

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Profile image uploaded successfully",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    console.error("❌ Upload profile image error:", error);
    return res.status(500).json({
      success: false,
      msg: error.message || "Failed to upload profile image",
    });
  }
};

// Remove profile image
exports.removeProfileImage = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Delete from ImageKit
    if (user.profilePicture?.publicId) {
      try {
        await deleteFile(user.profilePicture.publicId);
      } catch (err) {
        console.error("Error deleting profile image from ImageKit:", err);
      }
    }

    // Remove from user document
    user.profilePicture = null;
    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Profile image removed successfully",
    });
  } catch (error) {
    console.error("❌ Remove profile image error:", error);
    return res.status(500).json({
      success: false,
      msg: error.message || "Failed to remove profile image",
    });
  }
};

// Update user profile information
exports.updateCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      fullName,
      email,
      phoneNumber,
      dateOfBirth,
      gender,
      farmerType,
      language,
      address,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Update allowed fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (farmerType) user.farmerType = farmerType;
    if (language) user.language = language;
    if (address) {
      user.address = { ...user.address, ...address };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        farmerType: user.farmerType,
        language: user.language,
        address: user.address,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    return res.status(500).json({
      success: false,
      msg: error.message || "Failed to update profile",
    });
  }
};
