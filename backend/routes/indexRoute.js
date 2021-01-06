const indexController = require('../controllers/indexController')
const express = require('express')
const router = express.Router()
const {catchAsync} = require('../middlewares/errors');

router.get('/', catchAsync(indexController.home));

module.exports = router;
