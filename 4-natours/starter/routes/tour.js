const express = require('express');
const {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopRated,
} = require('../controllers/tour');

const router = express.Router();

//param middleware would only work for this route
router.route('/top-rated').get(aliasTopRated, getAllTour); //route aliasing
router.route(`/`).get(getAllTour).post(createTour);
router.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
