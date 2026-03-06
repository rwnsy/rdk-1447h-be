const crypto = require("crypto");
const path = require("path");
const fileValidationService = require("../utils/FileValidationService");

/**
 * Service konversi gambar ke/dari Base64 untuk penyimpanan di MongoDB.
 *
 * Alur upload  : Buffer biner → validasi → base64 string → disimpan di DB
 * Alur download: base64 string dari DB → Buffer biner → dikirim ke client
 */
class Base64FileService {
  constructor() {
    this.validator = fileValidationService;
  }

  /**
   * Konversi Buffer gambar ke base64 string.
   * File > 16 MB diproses per-chunk untuk menghindari masalah memori.x
   * @param {Buffer} fileBuffer
   * @returns {{ base64: string, hash: string, originalSize: number, base64Size: number }}
   */
  fileToBase64(fileBuffer) {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error("Input harus berupa Buffer.");
    }
    if (fileBuffer.length === 0) {
      throw new Error("Buffer kosong tidak dapat dikonversi.");
    }

    const CHUNK_SIZE = 16 * 1024 * 1024; // 16 MB
    let base64String;

    if (fileBuffer.length > CHUNK_SIZE) {
      const chunks = [];
      for (let offset = 0; offset < fileBuffer.length; offset += CHUNK_SIZE) {
        const chunk = fileBuffer.subarray(
          offset,
          Math.min(offset + CHUNK_SIZE, fileBuffer.length),
        );
        chunks.push(chunk.toString("base64"));
      }
      base64String = chunks.join("");
    } else {
      base64String = fileBuffer.toString("base64");
    }

    return {
      base64: base64String,
      hash: this.generateFileHash(fileBuffer),
      originalSize: fileBuffer.length,
      base64Size: base64String.length,
    };
  }

  /**
   * Konversi base64 string kembali ke Buffer biner.
   * Mendukung format data URL (contoh: "data:image/png;base64,iVBOR...")
   * @param {string} base64String
   * @param {string|null} expectedHash - SHA-256 hash untuk verifikasi integritas (opsional)
   * @returns {Buffer}
   */
  base64ToBuffer(base64String, expectedHash = null) {
    if (!base64String || typeof base64String !== "string") {
      throw new Error("Base64 string tidak valid.");
    }

    // Buang prefix data URL jika ada
    let cleanBase64 = base64String.includes(",")
      ? base64String.split(",")[1]
      : base64String;

    if (cleanBase64.length === 0) {
      throw new Error("Base64 string kosong setelah pembersihan.");
    }

    // Padding yang tidak valid akan menghasilkan buffer yang salah
    if (cleanBase64.length % 4 === 1) {
      throw new Error("Base64 string tidak valid: padding tidak sesuai.");
    }

    const fileBuffer = Buffer.from(cleanBase64, "base64");

    if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
      throw new Error("Gagal membuat buffer dari base64 string.");
    }

    if (expectedHash) {
      const actualHash = this.generateFileHash(fileBuffer);
      if (actualHash !== expectedHash) {
        throw new Error("Pemeriksaan integritas file gagal: hash tidak cocok.");
      }
    }

    return fileBuffer;
  }

  /**
   * Proses gambar untuk disimpan ke MongoDB.
   * Melakukan validasi, konversi ke base64, dan menghasilkan metadata lengkap.
   *
   * @param {Buffer} fileBuffer - Buffer biner file gambar
   * @param {{ originalName: string, mimeType: string }} fileInfo
   * @returns {{
   *   originalName: string,
   *   mimeType: string,
   *   fileExtension: string,
   *   fileSize: number,
   *   base64Data: string,
   *   fileHash: string
   * }}
   */
  processImageForStorage(fileBuffer, fileInfo) {
    if (!Buffer.isBuffer(fileBuffer)) {
      throw new Error("fileBuffer harus berupa Buffer.");
    }

    const validation = this.validator.validateFile({
      originalName: fileInfo.originalName,
      mimeType: fileInfo.mimeType,
      size: fileBuffer.length,
    });

    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const base64Result = this.fileToBase64(fileBuffer);

    return {
      originalName: fileInfo.originalName,
      mimeType: fileInfo.mimeType,
      fileExtension: path.extname(fileInfo.originalName).toLowerCase(),
      fileSize: fileBuffer.length,
      base64Data: base64Result.base64,
      fileHash: base64Result.hash,
    };
  }

  /**
   * Proses gambar dari MongoDB untuk dikirim ke client.
   * Mengonversi base64Data kembali ke Buffer dan memverifikasi integritas.
   *
   * @param {string} base64Data - base64Data yang tersimpan di MongoDB
   * @param {{ originalName: string, mimeType: string, fileHash?: string }} fileInfo
   * @returns {{ fileBuffer: Buffer, originalName: string, mimeType: string, fileSize: number }}
   */
  processImageForDisplay(base64Data, fileInfo) {
    if (!base64Data || typeof base64Data !== "string") {
      throw new Error("base64Data tidak valid.");
    }

    const fileBuffer = this.base64ToBuffer(
      base64Data,
      fileInfo.fileHash || null,
    );

    return {
      fileBuffer,
      originalName: fileInfo.originalName,
      mimeType: fileInfo.mimeType,
      fileSize: fileBuffer.length,
    };
  }

  /**
   * Hasilkan SHA-256 hash dari Buffer untuk verifikasi integritas
   * @param {Buffer} fileBuffer
   * @returns {string}
   */
  generateFileHash(fileBuffer) {
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  }

  /**
   * Format ukuran byte ke string yang mudah dibaca
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    return this.validator.formatFileSize(bytes);
  }
}

// Export singleton
module.exports = new Base64FileService();
