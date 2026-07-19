const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    origin: { type: String, required: true },
    price: { type: Number, required: true },
    thickness: { type: String, required: true },
    finish: { type: String, required: true },
    description: { type: String, default: '' },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
