const Tour = require('../models/tour');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllTour = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      //format using JSend standard
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const tour = await Tour.create(req.body);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.updateTour = async (req, res) => {
  const {
    params: { id },
    body,
  } = req;

  try {
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
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

exports.aliasTopRated = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getStats = async (req, res) => {
  try {
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
  } catch (e) {
    res.status(400).json({
      status: 'fail',
      message: e.message,
    });
  }
};

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
