const Tour = require('../models/tour');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllTour = catchAsync(async (req, res) => {
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .fieldLimit()
    .pagination();
  const tours = await features.getDatabaseQuery();

  res.status(200).json({
    //format using JSend standard
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  res.status(200).json({
    //format using JSend standard
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = catchAsync(async (req, res) => {
  const tour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  const tour = await Tour.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.deleteTour = catchAsync(async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.aliasTopRated = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getStats = catchAsync(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        // the original documents that matches would be transformed to the one below
        _id: '$difficulty',
        totalTours: { $sum: 1 }, // for every rating that pass this pipeline, add 1 to the total
        totalRating: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
    // {
    //   $match: {
    //     _id: { $ne: 'easy' },
    //   },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = parseInt(req.params.year, 10);

  //unwind destruct an array in a field and create a copy of document related to the unique value
  const plan = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: {
          //for each document that passes this pipeline, add its name
          $push: '$name',
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: {
        count: -1,
      },
    },
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: plan,
  });
});

exports.checkId = (req, res, next, value) => {
  // // const id = parseInt(value, 10);
  // //
  // // if (id >= _tours.length) {
  // //   return res.status(404).json({
  // //     status: 'fail',
  // //     message: 'Invalid ID',
  // //   });
  // // }
  //
  // req.params.id = id;
  //
  // next();
};

exports.checkBody = (req, res, next) => {
  const {
    body: { name, price },
  } = req;

  if (!name || !price) {
    return res.status(400).json({
      status: 'fail',
      data: req.body,
    });
  }

  next();
};
