const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  colorBase: { type: String, required: true },
  colorVein: { type: String, required: true },
});

module.exports = mongoose.model('Category', categorySchema);
