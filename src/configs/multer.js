const multer = require("multer");
const fileValidationService = require("../utils/FileValidationService");

// Simpan file di memori sebagai Buffer, bukan di disk
const storage = multer.memoryStorage();

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
