const productTypeController = require('../controllers/productTypeController')
const express = require('express')
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken')
const {catchAsync} = require('../middlewares/errors')

router.post('/', authenticateToken.checkToken, productTypeController.validateCreate, productTypeController.checkCreateValidaton, catchAsync(productTypeController.create));
router.get('/:id',authenticateToken.checkToken, catchAsync(productTypeController.getByID))
router.delete('/:id', authenticateToken.checkToken, catchAsync(productTypeController.delete))
router.get('/',authenticateToken.checkToken, catchAsync(productTypeController.getAll))
router.put('/:id', authenticateToken.checkToken, productTypeController.validateCreate, productTypeController.checkCreateValidaton, catchAsync(productTypeController.update))

module.exports = router;