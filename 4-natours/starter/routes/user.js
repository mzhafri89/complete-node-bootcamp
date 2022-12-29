const express = require('express');
const {
  getAllUser,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');
const { register, login } = require('../controllers/auth');

const router = express.Router();

//register/login is only for creating/auth user, no need to add other http verb thus doesn't really need to comply with REST wholly
router.post('/register', register);
router.post('/login', login);
//other route follows the REST verb for crud ops
router.route(`/`).get(getAllUser).post(createUser);
router.route(`/:id`).get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
