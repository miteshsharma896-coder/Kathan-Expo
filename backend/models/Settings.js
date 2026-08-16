const mongoose = require('mongoose');

// Single-row settings document — only one will ever exist.
// Use Settings.getSingleton() to fetch or create it.
const settingsSchema = new mongoose.Schema({
  notificationEmail: { type: String, default: '' },
}, { timestamps: true });

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ notificationEmail: '' });
  return doc;
};

module.exports = mongoose.model('Settings', settingsSchema);
