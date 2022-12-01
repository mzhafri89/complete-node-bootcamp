const express = require('express');
const {
  getAllUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');

const router = express.Router();
router.route(`/`).get(getAllUser).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
