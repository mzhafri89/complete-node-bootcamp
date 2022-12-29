const express = require('express');
const {
  getAllUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');
const { register } = require('../controllers/auth');

const router = express.Router();

//register is only for creating user, no need to add other http verb
router.post('/register', register);
//other route follows the REST verb for crud ops
router.route(`/`).get(getAllUser).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
