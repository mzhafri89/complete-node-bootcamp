const Tour = require('../models/tour');

exports.getAllTour = async (req, res) => {
  try {
    //mongoose method
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(duration)
    //   .where('difficulty')
    //   .equals(difficulty);

    //build query
    //filtering
    const queryParams = { ...req.query };
    const paginationQueryParams = ['page', 'sort', 'limit', 'fields'];
    paginationQueryParams.forEach((param) => delete queryParams[param]);

    //advance filtering - express auto parse query params of fields[gte] = 10 to { fields: { gte: 10 } }
    let queryParamsString = JSON.stringify(queryParams);
    queryParamsString = queryParamsString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    let databaseQuery = Tour.find(JSON.parse(queryParamsString));

    //sorting - the sort by token would affect sorting from left to right
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');

      databaseQuery = databaseQuery.sort(sortBy);
    } else {
      databaseQuery = databaseQuery.sort('createdAt');
    }

    //field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');

      databaseQuery = databaseQuery.select(fields);
    } else {
      databaseQuery = databaseQuery.select('-__v');
    }

    //pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    databaseQuery = databaseQuery.skip(skip).limit(limit);

    if (req.query.page) {
      const count = await Tour.countDocuments();
      if (skip >= count) {
        throw new Error('No documents exist in the page');
      }
    }

    //execute query
    const tours = await databaseQuery;

    //send response
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
