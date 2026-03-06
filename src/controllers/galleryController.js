const Gallery = require("../models/galleryModel");
const base64FileService = require("../services/Base64FileService");

// CREATE a new gallery record (gambar opsional via multipart/form-data, field: 'images')
exports.createGallery = async (req, res) => {
  try {
    const { title, categories } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageData = base64FileService.processImageForStorage(
          file.buffer,
          {
            originalName: file.originalname,
            mimeType: file.mimetype,
          },
        );
        images.push(imageData);
      }
    }

    const newGallery = new Gallery({ title, categories, images });
    const savedGallery = await newGallery.save();
    res.status(201).json({ success: true, data: savedGallery });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error creating gallery record",
        error: error.message,
      });
  }
};

// GET all gallery records
exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find();
    if (galleries.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No gallery records found" });
    }
    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching gallery records",
        error: error.message,
      });
  }
};

// GET a single gallery record by ID
exports.getGalleryById = async (req, res) => {
  try {
    const { id } = req.params;
    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery record not found" });
    }
    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error fetching gallery record",
        error: error.message,
      });
  }
};

// GET satu gambar dari gallery sebagai binary — index berbasis 0
exports.getGalleryImage = async (req, res) => {
  try {
    const { id, index } = req.params;
    const imgIndex = parseInt(index, 10);
    const gallery = await Gallery.findById(id);
    if (!gallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery record not found" });
    }
    if (!gallery.images || gallery.images.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery has no images" });
    }
    if (isNaN(imgIndex) || imgIndex < 0 || imgIndex >= gallery.images.length) {
      return res.status(400).json({
        success: false,
        message: `Index tidak valid. Tersedia index 0 sampai ${gallery.images.length - 1}.`,
      });
    }
    const imageDoc = gallery.images[imgIndex];
    const result = base64FileService.processImageForDisplay(
      imageDoc.base64Data,
      {
        originalName: imageDoc.originalName,
        mimeType: imageDoc.mimeType,
        fileHash: imageDoc.fileHash,
      },
    );
    res.set("Content-Type", result.mimeType);
    res.set("Content-Disposition", `inline; filename="${result.originalName}"`);
    res.send(result.fileBuffer);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error retrieving gallery image",
        error: error.message,
      });
  }
};

// UPDATE a gallery record by ID
// Jika gambar baru dikirim → mengganti semua gambar lama.
// Jika tidak ada gambar baru → gambar lama tetap tersimpan.
exports.updateGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categories } = req.body;

    const updateData = { title, categories };
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const imageData = base64FileService.processImageForStorage(
          file.buffer,
          {
            originalName: file.originalname,
            mimeType: file.mimetype,
          },
        );
        newImages.push(imageData);
      }
      updateData.images = newImages;
    }

    const updatedGallery = await Gallery.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedGallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery record not found" });
    }
    res.status(200).json({ success: true, data: updatedGallery });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error updating gallery record",
        error: error.message,
      });
  }
};

// DELETE a gallery record by ID
exports.deleteGallery = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGallery = await Gallery.findByIdAndDelete(id);
    if (!deletedGallery) {
      return res
        .status(404)
        .json({ success: false, message: "Gallery record not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Gallery record deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting gallery record",
        error: error.message,
      });
  }
};
