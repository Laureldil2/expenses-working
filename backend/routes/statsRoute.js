const statsController = require('../controllers/statsController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require('../middlewares/errors')

router.get('/', authenticateToken.checkToken,catchAsync(statsController.get))

module.exports = router;