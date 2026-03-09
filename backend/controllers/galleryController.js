const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all gallery items
// @route   GET /api/gallery
// @access  Public
exports.getGallery = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;

    const query = { status: 'active' };
    if (category) query.category = category;

    const items = await Gallery.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Gallery.countDocuments(query);

    res.json({
      success: true,
      count: items.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery',
      error: error.message,
    });
  }
};

// @desc    Get featured gallery items
// @route   GET /api/gallery/featured
// @access  Public
exports.getFeatured = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const items = await Gallery.find({
      status: 'active',
      isFeatured: true,
    })
      .sort({ order: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured gallery',
      error: error.message,
    });
  }
};

// @desc    Get single gallery item
// @route   GET /api/gallery/:id
// @access  Public
exports.getItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      });
    }

    // Increment views
    item.views += 1;
    await item.save();

    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery item',
      error: error.message,
    });
  }
};

// @desc    Create gallery item
// @route   POST /api/gallery/admin
// @access  Private (Admin)
exports.createItem = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    const itemData = {
      ...req.body,
      image: {
        url: req.file.path,
        publicId: req.file.filename,
      },
      uploadedBy: req.user.id,
    };

    const item = await Gallery.create(itemData);

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating gallery item',
      error: error.message,
    });
  }
};

// @desc    Update gallery item
// @route   PUT /api/gallery/admin/:id
// @access  Private (Admin)
exports.updateItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      });
    }

    const updateData = { ...req.body };

    // If new image uploaded
    if (req.file) {
      // Delete old image
      if (item.image.publicId) {
        await cloudinary.uploader.destroy(item.image.publicId);
      }

      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
    }

    const updatedItem = await Gallery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating gallery item',
      error: error.message,
    });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/gallery/admin/:id
// @access  Private (Admin)
exports.deleteItem = async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found',
      });
    }

    // Delete image from cloudinary
    if (item.image.publicId) {
      await cloudinary.uploader.destroy(item.image.publicId);
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Gallery item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery item',
      error: error.message,
    });
  }
};

// @desc    Get gallery categories
// @route   GET /api/gallery/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'hotel', label: 'Hotels' },
      { value: 'restaurant', label: 'Restaurants' },
      { value: 'seminar', label: 'Seminars' },
      { value: 'training', label: 'Training' },
      { value: 'event', label: 'Events' },
      { value: 'other', label: 'Other' },
    ];

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message,
    });
  }
};
