module.exports = function handleUploadError(err, req, res, next) {
  if (!err) return next();

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image must be 5MB or smaller' });
  }

  return res.status(400).json({ error: err.message || 'Upload failed' });
};
