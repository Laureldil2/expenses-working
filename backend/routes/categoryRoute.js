const categoryController = require('../controllers/categoryController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require('../middlewares/errors')

router.post('/', authenticateToken.checkToken, categoryController.validateCreate, categoryController.checkCreateValidaton,catchAsync(categoryController.create));
router.get('/:id',authenticateToken.checkToken, catchAsync(categoryController.getByID))
router.delete('/:id', authenticateToken.checkToken, catchAsync(categoryController.delete))
router.get('/',authenticateToken.checkToken, catchAsync(categoryController.getAll))
router.put('/:id', authenticateToken.checkToken, categoryController.validateCreate, categoryController.checkCreateValidaton, catchAsync(categoryController.update))

module.exports = router;