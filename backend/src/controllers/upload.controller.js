function publicUrl(filename) {
  const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  return `${base}/uploads/${filename}`;
}

async function uploadCover(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const url = publicUrl(req.file.filename);
    res.json({ url, filename: req.file.filename });
  } catch (e) {
    next(e);
  }
}

module.exports = { uploadCover, publicUrl };
