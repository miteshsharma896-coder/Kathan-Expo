const express = require('express');
const path = require('path');
const fs = require('fs');
const requireAdmin = require('../middleware/auth');
const { uploadSingle, uploadMulti, MAX_SIZE_MB, ALLOWED_EXT } = require('../middleware/upload');
const router = express.Router();

// Helper — validate an already-saved file and clean up if bad
function validateSavedFile(file) {
  const ext = path.extname(file.filename).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    fs.unlink(file.path, () => {});
    return false;
  }
  return true;
}

// POST /api/upload
// Uploads ONE image (called per-file from the frontend loop).
// Returns { url } on success.
router.post('/', requireAdmin, (req, res) => {
  uploadSingle.single('image')(req, res, (err) => {
    if (err) {
      // Multer LIMIT_FILE_SIZE gives a specific code
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `Image size must not exceed ${MAX_SIZE_MB} MB.`,
        });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image file received' });
    if (!validateSavedFile(req.file)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

// POST /api/upload/batch
// Uploads multiple images in a single request.
// Returns { urls: [...] } on success.
// Any single file exceeding 5 MB aborts the whole request.
router.post('/batch', requireAdmin, (req, res) => {
  uploadMulti.array('images', 10)(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: `Each image must not exceed ${MAX_SIZE_MB} MB. Please reduce the file size and try again.`,
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Maximum 10 images per upload' });
      }
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files received' });
    }

    const urls = [];
    for (const file of req.files) {
      if (!validateSavedFile(file)) {
        // clean up all uploaded files in this batch
        req.files.forEach((f) => fs.unlink(f.path, () => {}));
        return res.status(400).json({ error: 'Invalid file type in batch' });
      }
      urls.push(`/uploads/${file.filename}`);
    }

    res.status(201).json({ urls });
  });
});

// DELETE /api/upload/:filename
// Removes a stored image from disk (admin only).
// Called when admin removes an image from the product form.
router.delete('/:filename', requireAdmin, (req, res) => {
  const filename = req.params.filename;

  // Security: prevent path traversal — only allow simple filenames
  if (!/^[\w\-]+\.(jpg|jpeg|png|webp)$/i.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  const filePath = path.join(__dirname, '..', 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Could not delete image' });
    }
    res.json({ deleted: true });
  });
});

module.exports = router;
