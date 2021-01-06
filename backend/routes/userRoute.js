const usersController = require('../controllers/usersController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require("../middlewares/errors");

router.post('/', usersController.validateRegister, usersController.checkRegisterValidation ,catchAsync(usersController.register));
router.post('/login', usersController.login);
router.get('/:id', usersController.getByID);
router.put('/:id', authenticateToken.checkToken, usersController.validateChangePassword, usersController.checkRegisterValidation, catchAsync(usersController.changePassword));

module.exports = router;