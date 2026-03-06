const Article = require("../models/articleModel");
const base64FileService = require("../services/Base64FileService");

// CREATE a new article (image opsional via multipart/form-data, field: 'image')
exports.createArticle = async (req, res) => {
  try {
    const { title, content, summary, status, category, publishedDate, writer } =
      req.body;

    let image = null;
    if (req.file) {
      image = base64FileService.processImageForStorage(req.file.buffer, {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
      });
    }

    const newArticle = new Article({
      title,
      content,
      summary,
      status,
      category,
      publishedDate,
      writer,
      image,
    });
    const savedArticle = await newArticle.save();
    res.status(201).json({ success: true, data: savedArticle });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating article",
      error: error.message,
    });
  }
};

// GET all articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find();
    if (articles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No articles found" });
    }
    res.status(200).json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching articles",
      error: error.message,
    });
  }
};

// GET a single article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    res.status(200).json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching article",
      error: error.message,
    });
  }
};

// GET article image as binary — untuk verifikasi hasil upload
exports.getArticleImage = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await Article.findById(id);
    if (!article) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    if (!article.image) {
      return res
        .status(404)
        .json({ success: false, message: "Article has no image" });
    }
    const result = base64FileService.processImageForDisplay(
      article.image.base64Data,
      {
        originalName: article.image.originalName,
        mimeType: article.image.mimeType,
        fileHash: article.image.fileHash,
      },
    );
    res.set("Content-Type", result.mimeType);
    res.set("Content-Disposition", `inline; filename="${result.originalName}"`);
    res.send(result.fileBuffer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving article image",
      error: error.message,
    });
  }
};

// UPDATE an article by ID (image opsional — jika tidak dikirim, image lama tetap tersimpan)
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, status, category, publishedDate, writer } =
      req.body;

    const updateData = {
      title,
      content,
      summary,
      status,
      category,
      publishedDate,
      writer,
    };
    if (req.file) {
      updateData.image = base64FileService.processImageForStorage(
        req.file.buffer,
        {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
        },
      );
    }

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedArticle) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    res.status(200).json({ success: true, data: updatedArticle });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating article",
      error: error.message,
    });
  }
};

// DELETE an article by ID
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedArticle = await Article.findByIdAndDelete(id);
    if (!deletedArticle) {
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting article",
      error: error.message,
    });
  }
};
