const Article = require("../models/articleModel");
const Category = require("../models/categoryModel");
const base64FileService = require("../services/Base64FileService");

// CREATE a new article (image opsional via multipart/form-data, field: 'image')
exports.createArticle = async (req, res) => {
  try {
    const { title, content, summary, status, categoryId, publishedDate, writer } =
      req.body;

    // Validate that the referenced category exists
    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Category not found. Provide a valid categoryId.",
      });
    }

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
      category: categoryId,
      publishedDate,
      writer,
      image,
    });
    const savedArticle = await newArticle.save();
    await savedArticle.populate("category", "name");
    res.status(201).json({ success: true, data: savedArticle });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating article",
      error: error.message,
    });
  }
};

// GET all articles — base64Data excluded to keep response size small
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find({}, { "image.base64Data": 0 })
      .populate("category", "name");
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
    const article = await Article.findById(id).populate("category", "name");
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
    const { title, content, summary, status, categoryId, publishedDate, writer } =
      req.body;

    // Validate category if a new one is being set
    if (categoryId !== undefined) {
      const categoryExists = await Category.exists({ _id: categoryId });
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Category not found. Provide a valid categoryId.",
        });
      }
    }

    const updateData = {
      title,
      content,
      summary,
      status,
      publishedDate,
      writer,
    };
    if (categoryId !== undefined) updateData.category = categoryId;
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
    }).populate("category", "name");
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
