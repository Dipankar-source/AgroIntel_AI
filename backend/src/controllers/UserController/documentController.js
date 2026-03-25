const pdfParse = require("pdf-parse");
const User = require("../../models/User/userData");
const { uploadFile, deleteFile, getSignedUrl } = require("../../utils/fileUpload/fileUpload");
const { 
    generateFileHash, 
    isFileDuplicate, 
    addUploadPoints, 
    removeDeletePoints,
    resetWeeklyPointsIfNeeded 
} = require("../../utils/points/pointsUtils");

// Async error wrapper to catch unhandled promise rejections
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const mapCategory = (category) => {
  if (category === "land") return "land_document";
  if (category === "personal") return "identity_document";
  if (category === "crop") return "crop_image";
  return "other";
};

const normalize = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : value;

const buildMatch = (label, parsed, existing) => {
  if (!parsed && !existing) {
    return { field: label, parsed: null, existing: null, isMatch: null };
  }
  if (!parsed || !existing) {
    return { field: label, parsed: parsed || null, existing: existing || null, isMatch: null };
  }
  const p = normalize(parsed);
  const e = normalize(existing);
  return {
    field: label,
    parsed,
    existing,
    isMatch: p === e,
  };
};

// Very lightweight heuristics to extract structured data from raw text
const parsePersonalDocument = (text = "") => {
  const result = {};

  // Full name - look for "Name" or "Farmer Name"
  const nameMatch = text.match(/(?:farmer\s*name|applicant\s*name|name)\s*[:\-]\s*([A-Z][A-Za-z.\s]+)\n?/i);
  if (nameMatch) result.fullName = nameMatch[1].trim();

  // Email
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) result.email = emailMatch[0].trim();

  // Phone (focus on Indian formats)
  const phoneMatch = text.match(/(\+?91[-\s]*)?[6-9][0-9]{9}/);
  if (phoneMatch) result.phoneNumber = phoneMatch[0].replace(/\D/g, "").slice(-10);

  // Date of birth
  const dobMatch =
    text.match(/(?:dob|date\s*of\s*birth)\s*[:\-]\s*([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4})/i) ||
    text.match(/([0-9]{1,2}[\/\-][0-9]{1,2}[\/\-][0-9]{2,4}).{0,10}(?:dob|date\s*of\s*birth)/i);
  if (dobMatch) result.dateOfBirthRaw = dobMatch[1].trim();

  // Pincode
  const pincodeMatch = text.match(/\b[1-9][0-9]{5}\b/);
  if (pincodeMatch) {
    result.address = result.address || {};
    result.address.pincode = pincodeMatch[0];
  }

  // Simple state/district detection (very basic)
  const stateMatch = text.match(/state\s*[:\-]\s*([A-Za-z\s]+)/i);
  if (stateMatch) {
    result.address = result.address || {};
    result.address.state = stateMatch[1].trim();
  }

  const districtMatch = text.match(/district\s*[:\-]\s*([A-Za-z\s]+)/i);
  if (districtMatch) {
    result.address = result.address || {};
    result.address.district = districtMatch[1].trim();
  }

  const villageMatch = text.match(/village\s*[:\-]\s*([A-Za-z0-9\s]+)/i);
  if (villageMatch) {
    result.address = result.address || {};
    result.address.village = villageMatch[1].trim();
  }

  return result;
};

const parseLandDocument = (text = "") => {
  const result = {};

  // Total land area with unit (acres / hectares)
  const areaMatch =
    text.match(/total\s+area\s*[:\-]\s*([0-9]+(?:\.[0-9]+)?)\s*(acres?|hectares?)/i) ||
    text.match(/([0-9]+(?:\.[0-9]+)?)\s*(acres?|hectares?)\s+(?:of\s+land|area)/i);

  if (areaMatch) {
    result.totalLandArea = parseFloat(areaMatch[1]);
    result.unit = areaMatch[2].toLowerCase().startsWith("hect") ? "hectares" : "acres";
  }

  // Soil type based on keywords
  const soilTypes = ["Alluvial", "Black", "Red", "Laterite", "Desert", "Mountain"];
  const foundSoil = soilTypes.find((type) =>
    new RegExp(type, "i").test(text),
  );
  if (foundSoil) {
    result.soilType = foundSoil;
  }

  return result;
};

const parseCropDocument = (text = "") => {
  // For now, only detect crop names and areas in a very basic way
  const knownCrops = ["Wheat", "Rice", "Mustard", "Potato", "Maize", "Sugarcane"];
  const crops = [];

  knownCrops.forEach((cropName) => {
    const regex = new RegExp(
      `${cropName}\\s*(?:-|:)?\\s*([0-9]+(?:\\.[0-9]+)?)?\\s*(acres?|hectares?)?`,
      "i",
    );
    const match = text.match(regex);
    if (match) {
      crops.push({
        cropName,
        area: match[1] ? parseFloat(match[1]) : undefined,
      });
    }
  });

  if (!crops.length) return {};
  return { currentCrops: crops };
};

const parseByCategory = (categoryRaw, text) => {
  if (!text || !text.trim()) return null;

  if (categoryRaw === "personal") {
    return { category: "personal", fields: parsePersonalDocument(text) };
  }
  if (categoryRaw === "land") {
    return { category: "land", fields: parseLandDocument(text) };
  }
  if (categoryRaw === "crop") {
    return { category: "crop", fields: parseCropDocument(text) };
  }

  // Default: try personal first, then land
  const personal = parsePersonalDocument(text);
  if (Object.keys(personal).length) {
    return { category: "personal", fields: personal };
  }
  const land = parseLandDocument(text);
  if (Object.keys(land).length) {
    return { category: "land", fields: land };
  }
  return null;
};

const buildMatchesForUser = (parsed, user) => {
  if (!parsed || !parsed.fields || !user) return null;

  const { category, fields } = parsed;
  const matches = [];

  if (category === "personal") {
    matches.push(
      buildMatch("fullName", fields.fullName, user.fullName),
      buildMatch("email", fields.email, user.email),
      buildMatch("phoneNumber", fields.phoneNumber, user.phoneNumber),
    );

    if (fields.address) {
      matches.push(
        buildMatch("address.village", fields.address.village, user.address?.village),
        buildMatch("address.district", fields.address.district, user.address?.district),
        buildMatch("address.state", fields.address.state, user.address?.state),
        buildMatch("address.pincode", fields.address.pincode, user.address?.pincode),
      );
    }
  }

  if (category === "land") {
    matches.push(
      buildMatch(
        "landHoldings.totalLandArea",
        fields.totalLandArea,
        user.landHoldings?.totalLandArea,
      ),
      buildMatch("landHoldings.unit", fields.unit, user.landHoldings?.unit),
      buildMatch("landHoldings.soilType", fields.soilType, user.landHoldings?.soilType),
    );
  }

  // For crops we only suggest new entries, so matching is less strict
  if (category === "crop" && Array.isArray(fields.currentCrops)) {
    fields.currentCrops.forEach((c) => {
      const existing = (user.currentCrops || []).find(
        (uc) => normalize(uc.cropName) === normalize(c.cropName),
      );
      matches.push(
        buildMatch(
          `currentCrops.${c.cropName}`,
          c.area || null,
          existing?.area || null,
        ),
      );
    });
  }

  return { category, fields, matches };
};

exports.uploadDocuments = async (req, res) => {
  try {
    console.log("📤 UPLOAD_DOCUMENTS Request received");
    console.log("   User ID:", req.userId);
    console.log("   Files:", req.files ? Object.keys(req.files) : "NONE");
    console.log("   Body:", req.body);
    
    const userId = req.userId;
    const categoryRaw = (req.body.category || "").toString().toLowerCase();
    const category = mapCategory(categoryRaw);

    const files = req.files?.documents || req.files?.file || req.files || [];
    const fileArray = Array.isArray(files) ? files : [files];
    
    console.log(`   Mapped category: ${categoryRaw} -> ${category}`);
    console.log(`   File count: ${fileArray.length}`);

    if (!fileArray.length) {
      console.warn("   ⚠️  No files provided");
      return res.status(400).json({
        success: false,
        msg: "No documents provided",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.error("   ❌ User not found:", userId);
      return res.status(404).json({ success: false, msg: "User not found" });
    }
    
    console.log("   ✅ User found:", user.fullName);

    // Reset weekly points if needed
    resetWeeklyPointsIfNeeded(user);

    const createdDocs = [];
    const parsedCandidates = [];
    let totalPointsAdded = 0;
    let duplicateFilesCount = 0;

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      console.log(`\n   📄 Processing file ${i + 1}/${fileArray.length}: ${file?.originalname}`);
      
      if (!file || !file.buffer) {
        console.warn(`   ⚠️  File ${i} missing buffer, skipping`);
        continue;
      }

      // Generate file hash for duplicate detection
      const fileHash = generateFileHash(file);
      console.log(`      File hash: ${fileHash?.substring(0, 8)}...`);

      // Check if file is duplicate
      if (fileHash && isFileDuplicate(user, fileHash)) {
        console.warn(`   ⚠️  File ${file.originalname} is a duplicate (hash match). Skipping points..`);
        duplicateFilesCount++;
        // Still continue to upload the file
      }

      console.log(`      Size: ${file.size} bytes, Type: ${file.mimetype}`);

      let extractedText = "";
      if (file.mimetype === "application/pdf") {
        try {
          console.log("      📖 Parsing PDF...");
          const parsed = await pdfParse(file.buffer);
          extractedText = (parsed.text || "").trim();
          console.log(`      ✅ PDF parsed, ${extractedText.length} chars`);
        } catch (err) {
          console.error("     ❌ PDF_PARSE_ERROR:", err.message);
        }
      } else if (file.mimetype.startsWith("text/")) {
        try {
          console.log("      📝 Reading text file...");
          extractedText = file.buffer.toString("utf8");
          console.log(`      ✅ Text read, ${extractedText.length} chars`);
        } catch (err) {
          console.error("      ❌ TEXT_PARSE_ERROR:", err.message);
        }
      }

      const description = extractedText
        ? extractedText.slice(0, 500)
        : `Uploaded ${file.originalname}`;

      console.log("      ☁️  Uploading to ImageKit...");
      
      const uploaded = await uploadFile(file, {
        category,
        userId,
        // Make document URLs publicly accessible so they can be opened/downloaded
        isPublic: true,
        description,
        tags: extractedText ? ["parsed"] : [],
      });
      
      console.log(`      ✅ Uploaded! URL: ${uploaded.url}`);

      user.documents = user.documents || [];
      user.documents.push(uploaded);
      const createdSubdoc = user.documents[user.documents.length - 1];
      createdDocs.push(createdSubdoc);

      // Add points if not a duplicate
      if (fileHash && !isFileDuplicate(user, fileHash)) {
        // Remove the temp entry we might have added, then add properly
        user.documents = user.documents.filter(doc => doc._id?.toString() !== createdSubdoc._id?.toString());
        
        const pointsAdded = await addUploadPoints(user, fileHash, file);
        user.documents.push(createdSubdoc);
        
        console.log(`      🎯 Points added: +${pointsAdded}`);
        totalPointsAdded += pointsAdded;
      }

      const parsedForFile = parseByCategory(categoryRaw, extractedText);
      if (parsedForFile) {
        parsedCandidates.push(parsedForFile);
      }
    }

    console.log(`\n   💾 Saving ${createdDocs.length} documents to database...`);
    await user.save();
    console.log("   ✅ User saved successfully!");
    console.log(`   📊 Points awarded: ${totalPointsAdded.toFixed(2)} | Duplicates skipped: ${duplicateFilesCount}`);

    // Combine parsed candidates into a single suggestion (we expect typically one file at a time)
    let combinedParsed = null;
    if (parsedCandidates.length === 1) {
      combinedParsed = parsedCandidates[0];
    } else if (parsedCandidates.length > 1) {
      const base = parsedCandidates[0];
      for (let i = 1; i < parsedCandidates.length; i += 1) {
        if (parsedCandidates[i].category !== base.category) continue;
        Object.assign(base.fields, parsedCandidates[i].fields);
      }
      combinedParsed = base;
    }

    const parsedSummary = combinedParsed
      ? buildMatchesForUser(combinedParsed, user)
      : null;

    return res.status(201).json({
      success: true,
      documents: createdDocs,
      parsed: parsedSummary,
      points: {
        totalPoints: user.farmerPoints?.totalPoints || 0,
        weeklyPoints: user.farmerPoints?.weeklyPoints || 0,
        pointsAdded: totalPointsAdded,
        duplicateFilesSkipped: duplicateFilesCount
      },
      msg: parsedSummary
        ? "Documents uploaded. We found details that may update your profile. Please review and confirm on the client."
        : "Documents uploaded successfully.",
    });
  } catch (error) {
    console.error("❌ UPLOAD_DOCUMENTS_ERROR:", {
      message: error.message,
      stack: error.stack,
      details: error
    });
    
    return res.status(500).json({
      success: false,
      msg: error.message || "Failed to upload documents",
      error: error.message || "Unknown error occurred"
    });
  }
};

exports.getDocuments = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("documents");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Generate signed URLs for private documents so they can be viewed/downloaded
    const documents = (user.documents || []).map((doc) => {
      const d = doc.toObject ? doc.toObject() : { ...doc };
      if (d.url && d.isPublic === false) {
        d.url = getSignedUrl(d.url);
        if (d.thumbnailUrl) {
          d.thumbnailUrl = getSignedUrl(d.thumbnailUrl);
        }
      }
      return d;
    });

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("GET_DOCUMENTS_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch documents",
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    const { id } = req.params;

    // Find the document to get its publicId and file info
    const docToDelete = (user.documents || []).find(doc => doc._id?.toString() === id);

    if (!docToDelete) {
      return res.status(404).json({ success: false, msg: "Document not found" });
    }

    // Generate file hash from the document info for points deduction
    const fileHash = docToDelete.fileName ? 
      generateFileHash({
        originalname: docToDelete.fileName,
        size: docToDelete.fileSize,
        mimetype: docToDelete.fileFormat
      }) : null;

    // Deduct points if file hash exists
    let pointsDeducted = 0;
    if (fileHash) {
      pointsDeducted = await removeDeletePoints(user, fileHash, {
        originalname: docToDelete.fileName
      });
    }

    // Recalculate weekly points after deletion
    resetWeeklyPointsIfNeeded(user);

    // Delete from ImageKit if it has a publicId
    if (docToDelete.publicId) {
      try {
        await deleteFile(docToDelete.publicId);
      } catch (ikError) {
        console.error("Failed to delete from ImageKit:", ikError);
        // Continue with DB deletion even if ImageKit fails
      }
    }

    // Remove from user's documents array
    user.documents = (user.documents || []).filter(
      (doc) => doc._id?.toString() !== id,
    );

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Document removed",
      points: {
        totalPoints: user.farmerPoints?.totalPoints || 0,
        weeklyPoints: user.farmerPoints?.weeklyPoints || 0,
        pointsDeducted: pointsDeducted
      }
    });
  } catch (error) {
    console.error("DELETE_DOCUMENT_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to delete document",
    });
  }
};

exports.applyParsedData = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, fields } = req.body || {};

    if (!category || !fields || typeof fields !== "object") {
      return res.status(400).json({
        success: false,
        msg: "category and fields are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    if (category === "personal") {
      if (fields.fullName) user.fullName = fields.fullName;
      if (fields.email) user.email = fields.email;
      if (fields.phoneNumber) user.phoneNumber = fields.phoneNumber;

      if (fields.dateOfBirthRaw) {
        const parsedDate = new Date(fields.dateOfBirthRaw);
        if (!Number.isNaN(parsedDate.getTime())) {
          user.dateOfBirth = parsedDate;
        }
      }

      if (fields.address) {
        user.address = user.address || {};
        if (fields.address.village) user.address.village = fields.address.village;
        if (fields.address.district) user.address.district = fields.address.district;
        if (fields.address.state) user.address.state = fields.address.state;
        if (fields.address.pincode) user.address.pincode = fields.address.pincode;
      }
    } else if (category === "land") {
      user.landHoldings = user.landHoldings || {};
      if (typeof fields.totalLandArea === "number") {
        user.landHoldings.totalLandArea = fields.totalLandArea;
      }
      if (fields.unit) user.landHoldings.unit = fields.unit;
      if (fields.soilType) user.landHoldings.soilType = fields.soilType;
    } else if (category === "crop" && Array.isArray(fields.currentCrops)) {
      user.currentCrops = user.currentCrops || [];
      fields.currentCrops.forEach((c) => {
        if (!c || !c.cropName) return;
        user.currentCrops.push({
          cropName: c.cropName,
          area: c.area,
        });
      });
    } else {
      return res.status(400).json({
        success: false,
        msg: "Unsupported category for applying parsed data",
      });
    }

    await user.save();

    const freshUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      success: true,
      msg: "Profile updated from document data",
      user: freshUser,
    });
  } catch (error) {
    console.error("APPLY_PARSED_DATA_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to apply parsed data",
    });
  }
};

exports.getFarmerPoints = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("farmerPoints activePlan");
    if (!user) {
      return res.status(404).json({ success: false, msg: "User not found" });
    }

    // Initialize farmerPoints for existing users who don't have them yet
    if (!user.farmerPoints || user.farmerPoints.totalPoints == null) {
      const { initializeFarmerPoints } = require("../../utils/points/pointsUtils");
      const plan = user.activePlan?.planName || 'Free';
      user.farmerPoints = initializeFarmerPoints(plan);
    }

    resetWeeklyPointsIfNeeded(user);
    await user.save();

    return res.status(200).json({
      success: true,
      points: {
        totalPoints: user.farmerPoints.totalPoints,
        weeklyPoints: user.farmerPoints.weeklyPoints,
        uploadedFileHashes: user.farmerPoints.uploadedFileHashes || [],
        weekResetDate: user.farmerPoints.weekResetDate,
        pointHistory: user.farmerPoints.pointHistory || []
      }
    });
  } catch (error) {
    console.error("GET_FARMER_POINTS_ERROR:", error);
    return res.status(500).json({
      success: false,
      msg: "Failed to fetch farmer points",
    });
  }
};


