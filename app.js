// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/reviews');
const methodOverride = require('method-override');
const catchAsync = require('./utils/catchAsync');
const expressError = require('./utils/ExpressError');
const { schema, reviewSchema } = require('./validateSchema');
engine = require('ejs-mate');

// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camps';

// mongoose.connect('dbUrl', {

mongoose.connect(
  'mongodb+srv://lDraGo:cO0XDViDrMfAoma3@cluster0.lak4c.mongodb.net/camps',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('db connected!!!');
});

// ******************************
//joi validate function
//******************************
const validateCamp = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    // console.error(error);
    const msg = error.details.map((el) => el.message).join(', ');
    //console.log(msg);
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(', ');
    console.log(msg);
    throw new expressError(msg, 400);
  } else {
    next();
  }
};

// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('view engine', 'ejs');

// *****************************************************
//for post
// *****************************************************
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.render('home');
});

// *****************************************************
//show all items
// *****************************************************

app.get(
  '/campgrounds',
  catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render('campgrounds/index', { campgrounds });
  })
);

// *****************************************************
//Ccreate new item
// *****************************************************
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});
app.post(
  '/campgrounds',
  validateCamp,
  catchAsync(async (req, res, next) => {
    const newCamp = new Campground(req.body.camps);
    // console.log(newCamp);
    await newCamp.save();
    res.redirect(`/campgrounds/`);
  })
);
// *****************************************************
//show individual item
// *****************************************************
app.get(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const found = await Campground.findById(req.params.id).populate('reviews');
    // console.log(found);
    res.render('campgrounds/show', { found });
  })
);

// *****************************************************
//edit individual item
// *****************************************************
app.get(
  '/campgrounds/:id/edit',
  catchAsync(async (req, res) => {
    const edit = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', { edit });
  })
);

app.put(
  '/campgrounds/:id',
  validateCamp,
  catchAsync(async (req, res) => {
    // res.send('it wokrked');
    const { id } = req.params;

    //res.send(req.body);

    const edit = await Campground.findByIdAndUpdate(id, { ...req.body.camps });
    res.redirect(`/campgrounds/${edit._id}`);
  })
);

// *****************************************************
//delete item
// *****************************************************
app.delete(
  '/campgrounds/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  })
);

// *****************************************************
//post review for that campground
// *****************************************************
app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    //  res.send('you did it taa');
    const { id } = req.params;
    const camp = await Campground.findById(id);
    // show.ejs me ja usme review[ratings] review[body]so uske andar ka maal review me
    const reviews = await Review(req.body.review);
    camp.reviews.push(reviews);
    await reviews.save();
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

// *****************************************************
//delete review of that camp
// *****************************************************
app.delete(
  '/campgrounds/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    // res.send(req.params);

    const { id, reviewId } = req.params;
    // pull review id from that array named reviews
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

// *****************************************************
//error handling for all
// *****************************************************
app.all('*', (req, res, next) => {
  // res.send('404 not found!!!!');
  next(new expressError('Page not found', 404));
});

// *****************************************************
//error handling
// *****************************************************
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  console.log(err);
  if (!err.message) err.message = 'Kuch tau gadbad hai daya!!!';
  res.status(status).render('error', { err });
});
// *****************************************************
//connection established
// *****************************************************
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
