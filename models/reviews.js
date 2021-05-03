const mongoose = require('mongoose');
// mongoose.schema is huge so so shorten it up!!
const Schema = mongoose.Schema;
const reviewSchema = new Schema({
  body: String,
  rating: Number,
});
module.exports = mongoose.model('Review', reviewSchema);
