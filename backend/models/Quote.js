const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    qty: { type: Number, required: true },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quote', quoteSchema);
