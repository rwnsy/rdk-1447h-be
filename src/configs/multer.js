const multer = require("multer");
const path = require("path");
const fileValidationService = require("../utils/FileValidationService");
const fs = require("fs");
const uploadDir = "uploads/gallery";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/gallery/"); 
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const validation = fileValidationService.validateMimeType(file.mimetype);
  if (validation.isValid) {
    cb(null, true);
  } else {
    cb(new Error(validation.error), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB — sama dengan FileValidationService
  fileFilter,
});

module.exports = upload;
