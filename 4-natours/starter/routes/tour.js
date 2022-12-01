const express = require('express');
const {
  getAllTour,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('../controllers/tour');

const router = express.Router();

//param middleware would only work for this route
router.param('id', checkId);
router.route(`/`).get(getAllTour).post(checkBody, createTour);
router.route(`/:id`).get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
