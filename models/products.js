const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  type: String,
  city: String,
  price: Number,
  style: String,
  color: String,
  category: String,
  bigcategory: String,
  smallcategory: String,
  mainImages[0]: String,
  name: String,
  vendeur: String,
  createdAt: Date,
  updatedAt: Date
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;