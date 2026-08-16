const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT  = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE_MB   = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG or WEBP images are allowed'));
  }
  cb(null, true);
}

// single — used by POST /api/upload (one image at a time, called in a loop from frontend)
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

// multi — used by POST /api/upload/batch (up to 10 images in one request)
const uploadMulti = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_BYTES, // enforced per-file by multer
    files: 10,
  },
});

module.exports = { uploadSingle, uploadMulti, MAX_SIZE_MB, MAX_SIZE_BYTES, ALLOWED_EXT };
