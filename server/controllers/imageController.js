const Image = require('../models/Image');
const fs = require('fs');
const path = require('path');

// Get all images, sorted by sequence
exports.getAllImages = async (req, res) => {
  try {
    const images = await Image.find().sort({ sequence: 1 });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new image
exports.addImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Get the highest sequence number and increment by 1
    const highestSequence = await Image.findOne().sort('-sequence');
    const sequence = highestSequence ? highestSequence.sequence + 1 : 1;

    const imageUrl = `/uploads/${req.file.filename}`;
    
    const newImage = new Image({
      title: req.body.title,
      description: req.body.description || '',
      imageUrl,
      sequence
    });

    const savedImage = await newImage.save();
    res.status(201).json(savedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update an existing image
exports.updateImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Update fields that are provided
    if (req.body.title) image.title = req.body.title;
    if (req.body.description) image.description = req.body.description;
    
    // If a new image file is uploaded, update the image URL and delete the old file
    if (req.file) {
      // Delete the old image file
      const oldImagePath = path.join(__dirname, '..', image.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Update with new image URL
      image.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updatedImage = await image.save();
    res.json(updatedImage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete the image file from the filesystem
    const imagePath = path.join(__dirname, '..', image.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete the image document from the database
    await image.remove();
    
    // Resequence remaining images to maintain sequence integrity
    const remainingImages = await Image.find().sort({ sequence: 1 });
    for (let i = 0; i < remainingImages.length; i++) {
      remainingImages[i].sequence = i + 1;
      await remainingImages[i].save();
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the sequence of multiple images
exports.updateSequence = async (req, res) => {
  try {
    const { sequenceUpdates } = req.body;

    if (!sequenceUpdates || !Array.isArray(sequenceUpdates)) {
      return res.status(400).json({ message: 'Invalid sequence data' });
    }

    // Update each image's sequence
    for (const update of sequenceUpdates) {
      await Image.findByIdAndUpdate(update.id, { sequence: update.sequence });
    }

    const updatedImages = await Image.find().sort({ sequence: 1 });
    res.json(updatedImages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};