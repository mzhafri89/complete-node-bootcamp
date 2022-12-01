const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
);

exports.getAllTour = (_, res) => {
  res.status(200).json({
    //format using JSend standard
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tour = tours.find((t) => t.id === req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  }

  res.status(200).json({
    //format using JSend standard
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.createTour = (req, res) => {
  //by default express doesnt include request body, need to use middleware
  const id = tours[tours.length - 1].id + 1;
  const tour = { ...req.body, id };
  tours.push(tour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    'utf-8',
    (err) => {
      if (err) {
        res.status(500).json({
          status: 'error',
          message: err.message,
          code: 500,
          data: tour,
        });
      }

      res.status(201).json({
        status: 'success',
        data: tour,
      });
    }
  );
};

exports.updateTour = (req, res) => {
  const tour = tours.find((t) => t.id === req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  }

  const updatedTour = {
    ...tour,
    ...req.body,
  };

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
};

exports.deleteTour = (req, res) => {
  const tour = tours.find((t) => t.id === req.params.id);

  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

exports.checkId = (req, res, next, value) => {
  const id = parseInt(value);

  if (id >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  req.params.id = id;

  next();
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
