const User = require("../../models/User/userData");
const { uploadFile, deleteFile } = require("../../src/config/imagekitConfig");
const { updatePointsOnSubscriptionChange } = require("../../utils/points/pointsUtils");

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        let updateData = { ...req.body };

        // Get current user to check for existing images
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Handle image removal flags
        if (updateData.removeProfilePicture === 'true') {
            // Delete old profile picture from ImageKit if exists
            if (currentUser.profile?.profilePictureId) {
                try {
                    await deleteFile(currentUser.profile.profilePictureId);
                } catch (deleteError) {
                    console.error('Error deleting old profile picture:', deleteError);
                }
            }
            updateData['profile.profilePicture'] = null;
            updateData['profile.profilePictureId'] = null;
            delete updateData.removeProfilePicture;
        }

        if (updateData.removeBannerImage === 'true') {
            // Delete old banner image from ImageKit if exists
            if (currentUser.profile?.bannerImageId) {
                try {
                    await deleteFile(currentUser.profile.bannerImageId);
                } catch (deleteError) {
                    console.error('Error deleting old banner image:', deleteError);
                }
            }
            updateData['profile.bannerImage'] = null;
            updateData['profile.bannerImageId'] = null;
            delete updateData.removeBannerImage;
        }

        // Handle file uploads to ImageKit
        if (req.files) {
            // Handle profile picture
            if (req.files['file']) {
                // Delete old profile picture if exists
                if (currentUser.profile?.profilePictureId) {
                    try {
                        await deleteFile(currentUser.profile.profilePictureId);
                    } catch (deleteError) {
                        console.error('Error deleting old profile picture:', deleteError);
                    }
                }

                const profilePicResult = await uploadFile(
                    req.files['file'][0].buffer,
                    `profile_${userId}_${Date.now()}`,
                    'profiles'
                );
                updateData['profile.profilePicture'] = profilePicResult.url;
                updateData['profile.profilePictureId'] = profilePicResult.fileId;
            }

            // Handle banner image
            if (req.files['banner']) {
                // Delete old banner image if exists
                if (currentUser.profile?.bannerImageId) {
                    try {
                        await deleteFile(currentUser.profile.bannerImageId);
                    } catch (deleteError) {
                        console.error('Error deleting old banner image:', deleteError);
                    }
                }

                const bannerResult = await uploadFile(
                    req.files['banner'][0].buffer,
                    `banner_${userId}_${Date.now()}`,
                    'banners'
                );
                updateData['profile.bannerImage'] = bannerResult.url;
                updateData['profile.bannerImageId'] = bannerResult.fileId;
            }

            // Handle experience certificates
            if (req.files['experienceCertificate']) {
                const experienceCertificates = req.files['experienceCertificate'];
                let experienceData = [];

                // Parse existing experience data if provided
                if (updateData.experience) {
                    try {
                        experienceData = Array.isArray(updateData.experience) 
                            ? updateData.experience.map(item => typeof item === 'string' ? JSON.parse(item) : item)
                            : JSON.parse(updateData.experience);
                    } catch (e) {
                        console.error('Error parsing experience:', e);
                        experienceData = currentUser.profile?.experience || [];
                    }
                } else {
                    experienceData = currentUser.profile?.experience || [];
                }

                // Upload certificates and update the corresponding experience items
                for (let i = 0; i < experienceCertificates.length; i++) {
                    const cert = experienceCertificates[i];
                    const certResult = await uploadFile(
                        cert.buffer,
                        `exp_cert_${userId}_${Date.now()}_${i}`,
                        'experience_certificates'
                    );

                    // If we have an experience item at this index, update it
                    if (i < experienceData.length) {
                        // Delete old certificate if exists
                        if (experienceData[i].certificateImageId) {
                            try {
                                await deleteFile(experienceData[i].certificateImageId);
                            } catch (deleteError) {
                                console.error('Error deleting old experience certificate:', deleteError);
                            }
                        }
                        
                        experienceData[i].certificateImage = certResult.url;
                        experienceData[i].certificateImageId = certResult.fileId;
                    } else {
                        // Create a new experience entry if needed
                        experienceData.push({
                            certificateImage: certResult.url,
                            certificateImageId: certResult.fileId,
                            title: 'Untitled Experience'
                        });
                    }
                }

                updateData['profile.experience'] = experienceData;
                delete updateData.experience;
            }

            // Handle education certificates
            if (req.files['educationCertificate']) {
                const educationCertificates = req.files['educationCertificate'];
                let educationData = [];

                // Parse existing education data if provided
                if (updateData.education) {
                    try {
                        educationData = Array.isArray(updateData.education) 
                            ? updateData.education.map(item => typeof item === 'string' ? JSON.parse(item) : item)
                            : JSON.parse(updateData.education);
                    } catch (e) {
                        console.error('Error parsing education:', e);
                        educationData = currentUser.profile?.education || [];
                    }
                } else {
                    educationData = currentUser.profile?.education || [];
                }

                // Upload certificates and update the corresponding education items
                for (let i = 0; i < educationCertificates.length; i++) {
                    const cert = educationCertificates[i];
                    const certResult = await uploadFile(
                        cert.buffer,
                        `edu_cert_${userId}_${Date.now()}_${i}`,
                        'education_certificates'
                    );

                    // If we have an education item at this index, update it
                    if (i < educationData.length) {
                        // Delete old certificate if exists
                        if (educationData[i].markSheetImageId) {
                            try {
                                await deleteFile(educationData[i].markSheetImageId);
                            } catch (deleteError) {
                                console.error('Error deleting old education certificate:', deleteError);
                            }
                        }
                        
                        educationData[i].markSheetImage = certResult.url;
                        educationData[i].markSheetImageId = certResult.fileId;
                    } else {
                        // Create a new education entry if needed
                        educationData.push({
                            markSheetImage: certResult.url,
                            markSheetImageId: certResult.fileId,
                            institution: 'Untitled Institution'
                        });
                    }
                }

                updateData['profile.education'] = educationData;
                delete updateData.education;
            }
        }

        // Parse skills from JSON string to array
        if (updateData.skills) {
            try {
                let skillsData = [];
                if (typeof updateData.skills === 'string') {
                    skillsData = JSON.parse(updateData.skills);
                } else if (Array.isArray(updateData.skills)) {
                    skillsData = updateData.skills;
                }
                
                // Clean up skills (remove quotes if present)
                updateData['profile.skills'] = skillsData.map(skill => {
                    if (typeof skill === 'string') {
                        return skill.replace(/^"(.*)"$/, '$1');
                    }
                    return skill;
                }).filter(skill => skill && skill.trim() !== '');
                
                delete updateData.skills;
            } catch (e) {
                console.error('Error parsing skills:', e);
                updateData['profile.skills'] = currentUser.profile?.skills || [];
                delete updateData.skills;
            }
        }

        // Parse experience if not already handled by file upload section
        if (updateData.experience && !updateData['profile.experience']) {
            try {
                let experienceData = [];
                
                if (Array.isArray(updateData.experience)) {
                    experienceData = updateData.experience.map(item => {
                        if (typeof item === 'string') {
                            item = JSON.parse(item);
                        }
                        
                        // Preserve existing certificate data if not being replaced
                        if (currentUser.profile?.experience) {
                            const existingExp = currentUser.profile.experience.find(exp => 
                                exp._id?.toString() === item._id || exp.id === item.id
                            );
                            
                            if (existingExp && !item.certificateImage && !item.certificateImageId) {
                                // Keep the existing certificate data
                                item.certificateImage = existingExp.certificateImage;
                                item.certificateImageId = existingExp.certificateImageId;
                            }
                        }
                        
                        return item;
                    });
                } else if (typeof updateData.experience === 'string') {
                    experienceData = JSON.parse(updateData.experience);
                    
                    // Preserve existing certificate data if not being replaced
                    experienceData = experienceData.map(item => {
                        if (currentUser.profile?.experience) {
                            const existingExp = currentUser.profile.experience.find(exp => 
                                exp._id?.toString() === item._id || exp.id === item.id
                            );
                            
                            if (existingExp && !item.certificateImage && !item.certificateImageId) {
                                // Keep the existing certificate data
                                item.certificateImage = existingExp.certificateImage;
                                item.certificateImageId = existingExp.certificateImageId;
                            }
                        }
                        
                        return item;
                    });
                }
                
                updateData['profile.experience'] = experienceData;
                delete updateData.experience;
            } catch (e) {
                console.error('Error parsing experience:', e);
                // If parsing fails, keep the existing experience data
                updateData['profile.experience'] = currentUser.profile?.experience || [];
                delete updateData.experience;
            }
        } else if (!updateData['profile.experience']) {
            // If no experience data is provided in the update, preserve the existing experience
            updateData['profile.experience'] = currentUser.profile?.experience || [];
        }

        // Parse education if not already handled by file upload section
        if (updateData.education && !updateData['profile.education']) {
            try {
                let educationData = [];
                
                if (Array.isArray(updateData.education)) {
                    educationData = updateData.education.map(item => {
                        if (typeof item === 'string') {
                            item = JSON.parse(item);
                        }
                        
                        // Preserve existing certificate data if not being replaced
                        if (currentUser.profile?.education) {
                            const existingEdu = currentUser.profile.education.find(edu => 
                                edu._id?.toString() === item._id || edu.id === item.id
                            );
                            
                            if (existingEdu && !item.markSheetImage && !item.markSheetImageId) {
                                // Keep the existing certificate data
                                item.markSheetImage = existingEdu.markSheetImage;
                                item.markSheetImageId = existingEdu.markSheetImageId;
                            }
                        }
                        
                        return item;
                    });
                } else if (typeof updateData.education === 'string') {
                    educationData = JSON.parse(updateData.education);
                    
                    // Preserve existing certificate data if not being replaced
                    educationData = educationData.map(item => {
                        if (currentUser.profile?.education) {
                            const existingEdu = currentUser.profile.education.find(edu => 
                                edu._id?.toString() === item._id || edu.id === item.id
                            );
                            
                            if (existingEdu && !item.markSheetImage && !item.markSheetImageId) {
                                // Keep the existing certificate data
                                item.markSheetImage = existingEdu.markSheetImage;
                                item.markSheetImageId = existingEdu.markSheetImageId;
                            }
                        }
                        
                        return item;
                    });
                }
                
                updateData['profile.education'] = educationData;
                delete updateData.education;
            } catch (e) {
                console.error('Error parsing education:', e);
                // If parsing fails, keep the existing education data
                updateData['profile.education'] = currentUser.profile?.education || [];
                delete updateData.education;
            }
        } else if (!updateData['profile.education']) {
            // If no education data is provided in the update, preserve the existing education
            updateData['profile.education'] = currentUser.profile?.education || [];
        }

        // Handle other profile fields
        const profileFields = ['headline', 'location', 'bio'];
        profileFields.forEach(field => {
            if (field in updateData) {
                updateData[`profile.${field}`] = updateData[field] === '' ? null : updateData[field];
                delete updateData[field];
            }
        });

        // Handle social links according to schema
        const socialFields = ['linkedin', 'github', 'portfolio'];
        socialFields.forEach(field => {
            if (field in updateData) {
                updateData[`profile.socialLinks.${field}`] = updateData[field] === '' ? null : updateData[field];
                delete updateData[field];
            }
        });

        // Handle fullName separately
        if (updateData.fullName) {
            updateData.fullName = updateData.fullName.trim();
        } else if (updateData.fullName === '') {
            delete updateData.fullName;
        }

        // Handle gender
        if (updateData.gender) {
            updateData.gender = updateData.gender;
        }

        // For array updates, we need to use $set with dot notation
        const setData = {};
        Object.keys(updateData).forEach(key => {
            setData[key] = updateData[key];
        });

        // Handle empty arrays for skills, experience, and education
        if (setData['profile.skills'] && setData['profile.skills'].length === 0) {
            setData['profile.skills'] = [];
        }
        
        if (setData['profile.experience'] && setData['profile.experience'].length === 0) {
            setData['profile.experience'] = [];
        }
        
        if (setData['profile.education'] && setData['profile.education'].length === 0) {
            setData['profile.education'] = [];
        }

        // Handle subscription plan changes - award bonus points if upgrading
        if (updateData['subscription.plan']) {
            const newPlan = updateData['subscription.plan'];
            if (newPlan !== currentUser.subscription?.plan) {
                updatePointsOnSubscriptionChange(currentUser, newPlan);
                if (currentUser.farmerPoints) {
                    setData['farmerPoints'] = currentUser.farmerPoints;
                }
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: setData },
            { new: true, runValidators: true }
        ).select('-password');


        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
        console.log(updatedUser)
        
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Error updating profile",
            error: error.message
        });
    }
}

module.exports = updateProfile;