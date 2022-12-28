const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
    },
    ratingsAverage: {
      type: Number,
      default: 0,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    discount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secret: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual properties - kinda like how a view table in rdb works - handles business logic

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//mongoose middleware - runs before/after query event - document,query,aggregate,model

//document middleware - runs before .save() and .create(), not .insertMany()
tourSchema.pre('save', function (next) {
  //onsole.log(this); //this points to current processing docs
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', (next) => {
//   //onsole.log(this); //this points to current processing docs
//   console.log('saving document');
//   next();
// });
//
// //executed after save
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

//query middleware
tourSchema.pre(/^find/, function (next) {
  //- use reg exp to trigger middleware for all event that start with find
  this.find({ secret: { $ne: true } }); //this would ref to the current query object
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took: ${Date.now() - this.start}ms`);
  next();
});

//aggregation middleware
tourSchema.pre('aggregate', function (next) {
  //console.log(this.pipeline()); //points to current agg object
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });

  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
