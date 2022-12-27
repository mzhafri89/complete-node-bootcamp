const express = require('express');
const {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopRated,
  getStats,
  getMonthlyPlan,
} = require('../controllers/tour');

const router = express.Router();

router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/stats').get(getStats);
router.route('/top-rated').get(aliasTopRated, getAllTour); //route aliasing - the first middleware would intercept and pre-define query params
router.route(`/`).get(getAllTour).post(createTour);
router.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
