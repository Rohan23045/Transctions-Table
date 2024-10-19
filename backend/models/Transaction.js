const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  price: Number,
  category: String,
  sold: Boolean,
  dateOfSale: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);
