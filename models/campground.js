const mongoose = require('mongoose');
const Review = require('./reviews');

mongoose.set('useFindAndModify', false);
// mongoose.schema is huge so so shorten it up!!
const Schema = mongoose.Schema;
const CampgroundSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});
CampgroundSchema.post('findOneAndDelete', async function (doc) {
  // console kar sab samjhega
  console.log(doc);
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
module.exports = mongoose.model('Campground', CampgroundSchema);
