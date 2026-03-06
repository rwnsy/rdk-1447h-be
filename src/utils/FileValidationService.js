const path = require("path");

/**
 * Service validasi file gambar.
 * Mendukung ekstensi: .jpg, .jpeg, .png, .gif, .webp
 * Batas ukuran: 5 MB per gambar
 */
class FileValidationService {
  constructor() {
    this.allowedMimeTypes = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/gif": ".gif",
      "image/webp": ".webp",
    };

    // Semua ekstensi yang diterima (termasuk alias .jpeg untuk image/jpeg)
    this.allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    this.maxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    this.dangerousExtensions = [
      ".exe",
      ".bat",
      ".cmd",
      ".com",
      ".pif",
      ".scr",
      ".vbs",
      ".jar",
      ".php",
      ".asp",
      ".jsp",
      ".sh",
      ".ps1",
      ".py",
      ".rb",
      ".pl",
    ];
  }

  getAllowedMimeTypes() {
    return Object.keys(this.allowedMimeTypes);
  }

  getAllowedExtensions() {
    return this.allowedExtensions;
  }

  /**
   * Validasi MIME type file
   * @param {string} mimeType
   * @returns {{ isValid: boolean, error?: string }}
   */
  validateMimeType(mimeType) {
    if (!this.allowedMimeTypes[mimeType]) {
      return {
        isValid: false,
        error: `Tipe file '${mimeType}' tidak diizinkan. Hanya gambar yang diperbolehkan: JPEG, PNG, GIF, WebP.`,
        allowedTypes: this.getAllowedMimeTypes(),
      };
    }
    return { isValid: true };
  }

  /**
   * Validasi ekstensi file
   * @param {string} extension - contoh: ".jpg"
   * @returns {{ isValid: boolean, error?: string }}
   */
  validateExtension(extension) {
    const normalized = extension.toLowerCase();

    if (this.dangerousExtensions.includes(normalized)) {
      return {
        isValid: false,
        error: `Ekstensi '${extension}' berpotensi berbahaya dan tidak diizinkan.`,
      };
    }

    if (!this.allowedExtensions.includes(normalized)) {
      return {
        isValid: false,
        error: `Ekstensi '${extension}' tidak diizinkan. Ekstensi yang diperbolehkan: ${this.allowedExtensions.join(", ")}.`,
        allowedExtensions: this.allowedExtensions,
      };
    }

    return { isValid: true };
  }

  /**
   * Validasi ukuran file
   * @param {number} fileSize - ukuran dalam bytes
   * @returns {{ isValid: boolean, error?: string }}
   */
  validateFileSize(fileSize) {
    if (fileSize > this.maxFileSizeBytes) {
      return {
        isValid: false,
        error: `Ukuran file ${this.formatFileSize(fileSize)} melebihi batas maksimal ${this.formatFileSize(this.maxFileSizeBytes)}.`,
        maxSize: this.maxFileSizeBytes,
        currentSize: fileSize,
      };
    }
    return { isValid: true };
  }

  /**
   * Validasi lengkap untuk satu file gambar
   * @param {{ originalName: string, mimeType: string, size: number }} fileInfo
   * @returns {{ isValid: boolean, error?: string }}
   */
  validateFile(fileInfo) {
    const { originalName, mimeType, size } = fileInfo;
    const extension = path.extname(originalName);

    const mimeValidation = this.validateMimeType(mimeType);
    if (!mimeValidation.isValid) return mimeValidation;

    const extValidation = this.validateExtension(extension);
    if (!extValidation.isValid) return extValidation;

    const sizeValidation = this.validateFileSize(size);
    if (!sizeValidation.isValid) return sizeValidation;

    return {
      isValid: true,
      message: "Validasi file berhasil.",
    };
  }

  /**
   * Format ukuran byte ke string yang mudah dibaca
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Export singleton
module.exports = new FileValidationService();
